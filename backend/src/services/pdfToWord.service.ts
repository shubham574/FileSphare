import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

/**
 * Converts a PDF file to DOCX format using pdf2docx (Python library).
 *
 * This approach preserves:
 *  - Images (embedded in the PDF)
 *  - Text formatting (bold, italic, font sizes, colors)
 *  - Tables and their borders
 *  - Page margins and layout
 *  - Multi-column layouts
 *
 * Prerequisites:
 *  - Python must be installed and accessible via `python` command
 *  - pdf2docx must be installed: `pip install pdf2docx`
 */
export async function pdfToWord(filePath: string): Promise<string> {
  const outputPath = path.join(
    config.files.outputDir,
    `converted_${uuidv4()}.docx`
  );

  // Path to the Python converter script.
  // Always resolve from the project root (process.cwd()) so this works in
  // both dev (ts-node-dev, __dirname = src/services/) and production
  // (compiled, __dirname = dist/services/). The .py file lives in src/scripts/
  // and is never copied to dist/.
  const scriptPath = path.join(process.cwd(), 'src', 'scripts', 'pdf_to_docx.py');

  // Verify the script exists
  if (!fs.existsSync(scriptPath)) {
    throw new Error(
      `Conversion script not found at: ${scriptPath}. ` +
      `Ensure 'src/scripts/pdf_to_docx.py' exists.`
    );
  }

  await runPythonConverter(scriptPath, filePath, outputPath);

  return outputPath;
}

/**
 * Runs the Python pdf2docx conversion script as a child process.
 */
function runPythonConverter(
  scriptPath: string,
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Use 'python' on Windows; falls back gracefully
    const pythonBin = process.platform === 'win32' ? 'python' : 'python3';

    const proc = spawn(pythonBin, [scriptPath, inputPath, outputPath], {
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
        // Verify the output file actually exists
        if (!fs.existsSync(outputPath)) {
          return reject(
            new Error('PDF to Word conversion completed but output file is missing.')
          );
        }
        resolve();
      } else {
        // Surface the Python error to Node.js callers
        const errorMsg = stderr.trim() || stdout.trim() || 'Unknown conversion error';
        reject(
          new Error(
            `PDF to Word conversion failed (exit code ${code}): ${errorMsg}\n` +
            `Ensure Python and pdf2docx are installed: pip install pdf2docx`
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
