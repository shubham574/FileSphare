import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export type CompressionLevel = 'low' | 'medium' | 'high';

export interface CompressionResult {
  outputPath: string;
  inputSize: number;
  outputSize: number;
  reductionPercent: number;
  level: CompressionLevel;
}

/**
 * Compress a PDF using PyMuPDF (Python).
 *
 * Three levels:
 *   low    — 150 DPI images, JPEG quality 85  (~20-35% reduction, good quality)
 *   medium — 96 DPI images,  JPEG quality 70  (~40-60% reduction, balanced)
 *   high   — 72 DPI images,  JPEG quality 50  (~60-80% reduction, smallest file)
 *
 * Requires: pip install PyMuPDF  (already installed via pdf2docx)
 */
export async function compressPdf(
  filePath: string,
  opts: { level?: string } = {}
): Promise<CompressionResult> {
  const level = (opts.level as CompressionLevel) || 'medium';
  const outputPath = path.join(
    config.files.outputDir,
    `compressed_${uuidv4()}.pdf`
  );

  const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'compress_pdf.py');

  if (!fs.existsSync(scriptPath)) {
    throw new Error(
      `Compression script not found at: ${scriptPath}. ` +
      `Ensure 'src/scripts/compress_pdf.py' exists.`
    );
  }

  const result = await runPythonCompressor(scriptPath, filePath, outputPath, level);

  console.log(
    `[Compress] ${result.inputSize} → ${result.outputSize} bytes ` +
    `(${result.reductionPercent}% reduction, level=${result.level})`
  );

  return result;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

function runPythonCompressor(
  scriptPath: string,
  inputPath: string,
  outputPath: string,
  level: CompressionLevel
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const pythonBin = process.platform === 'win32' ? 'python' : 'python3';

    const proc = spawn(pythonBin, [scriptPath, inputPath, outputPath, level], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code: number | null) => {
      if (code === 0) {
        if (!fs.existsSync(outputPath)) {
          return reject(new Error('Compression completed but output file is missing.'));
        }

        // Parse the JSON stats printed by the Python script
        try {
          const stats = JSON.parse(stdout.trim()) as CompressionResult & { success: boolean };
          resolve({
            outputPath,
            inputSize: stats.inputSize,
            outputSize: stats.outputSize,
            reductionPercent: stats.reductionPercent,
            level: stats.level as CompressionLevel,
          });
        } catch {
          // Fallback if JSON parse fails — still return the output path
          const inputSize = fs.statSync(inputPath).size;
          const outputSize = fs.statSync(outputPath).size;
          resolve({
            outputPath,
            inputSize,
            outputSize,
            reductionPercent: parseFloat(
              (((inputSize - outputSize) / inputSize) * 100).toFixed(1)
            ),
            level,
          });
        }
      } else {
        const errorMsg = stderr.trim() || stdout.trim() || 'Unknown compression error';
        reject(
          new Error(
            `PDF compression failed (exit code ${code}): ${errorMsg}\n` +
            `Ensure Python and PyMuPDF are installed: pip install PyMuPDF`
          )
        );
      }
    });

    proc.on('error', (err: Error) => {
      reject(
        new Error(
          `Failed to start Python process: ${err.message}\n` +
          `Ensure Python is installed and available in PATH.`
        )
      );
    });
  });
}
