import { PDFDocument, degrees } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

interface RotateOptions {
  degrees?: 90 | 180 | 270;
  pages?: 'all' | number[]; // specific 1-indexed pages or 'all'
}

export async function rotatePdf(
  filePath: string,
  options: RotateOptions = {}
): Promise<string> {
  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  const rotateDeg = options.degrees ?? 90;
  const targetPages =
    options.pages === 'all' || !options.pages
      ? pages.map((_, i) => i)
      : (options.pages as number[]).map((n) => n - 1);

  targetPages.forEach((idx) => {
    if (idx >= 0 && idx < pages.length) {
      const page = pages[idx];
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotateDeg) % 360));
    }
  });

  const rotatedBytes = await pdfDoc.save();
  const outputPath = path.join(
    config.files.outputDir,
    `rotated_${uuidv4()}.pdf`
  );
  fs.writeFileSync(outputPath, rotatedBytes);

  return outputPath;
}
