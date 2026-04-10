import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

/**
 * Compress PDF by re-saving with pdf-lib (removes redundant objects, re-encodes).
 * For aggressive compression, Ghostscript would be needed (not required here).
 */
export async function compressPdf(filePath: string): Promise<string> {
  const inputBytes = fs.readFileSync(filePath);

  // Load with pdf-lib and re-save — this strips some overhead
  const pdfDoc = await PDFDocument.load(inputBytes, {
    updateMetadata: false,
  });

  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true, // packs objects more efficiently
    addDefaultPage: false,
  });

  const outputPath = path.join(
    config.files.outputDir,
    `compressed_${uuidv4()}.pdf`
  );
  fs.writeFileSync(outputPath, compressedBytes);

  const originalSize = inputBytes.length;
  const compressedSize = compressedBytes.length;
  const ratio = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

  console.log(
    `[Compress] ${originalSize} → ${compressedSize} bytes (${ratio}% reduction)`
  );

  return outputPath;
}
