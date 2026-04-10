import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export async function mergePdfs(filePaths: string[]): Promise<string> {
  if (filePaths.length < 2) {
    throw new Error('At least 2 PDF files are required to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (const filePath of filePaths) {
    const pdfBytes = fs.readFileSync(filePath);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  const outputPath = path.join(config.files.outputDir, `merged_${uuidv4()}.pdf`);
  fs.writeFileSync(outputPath, mergedBytes);

  return outputPath;
}
