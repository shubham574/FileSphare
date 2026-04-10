import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

interface PageNumberOptions {
  position?: 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left';
  fontSize?: number;
  startNumber?: number;
  format?: 'n' | 'Page n' | 'n of total'; // e.g. "1", "Page 1", "1 of 10"
  color?: { r: number; g: number; b: number };
}

export async function addPageNumbers(
  filePath: string,
  options: PageNumberOptions = {}
): Promise<string> {
  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const {
    position = 'bottom-center',
    fontSize = 12,
    startNumber = 1,
    format = 'Page n',
    color = { r: 0, g: 0, b: 0 },
  } = options;

  const pages = pdfDoc.getPages();
  const total = pages.length;

  pages.forEach((page, idx) => {
    const { width, height } = page.getSize();
    const pageNum = startNumber + idx;

    let label: string;
    switch (format) {
      case 'n':
        label = String(pageNum);
        break;
      case 'n of total':
        label = `${pageNum} of ${total}`;
        break;
      case 'Page n':
      default:
        label = `Page ${pageNum}`;
    }

    const textWidth = font.widthOfTextAtSize(label, fontSize);
    const margin = 20;

    let x: number;
    let y: number;

    switch (position) {
      case 'bottom-left':
        x = margin;
        y = margin;
        break;
      case 'bottom-right':
        x = width - textWidth - margin;
        y = margin;
        break;
      case 'top-left':
        x = margin;
        y = height - margin - fontSize;
        break;
      case 'top-right':
        x = width - textWidth - margin;
        y = height - margin - fontSize;
        break;
      case 'top-center':
        x = (width - textWidth) / 2;
        y = height - margin - fontSize;
        break;
      case 'bottom-center':
      default:
        x = (width - textWidth) / 2;
        y = margin;
    }

    page.drawText(label, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
    });
  });

  const numberedBytes = await pdfDoc.save();
  const outputPath = path.join(
    config.files.outputDir,
    `numbered_${uuidv4()}.pdf`
  );
  fs.writeFileSync(outputPath, numberedBytes);

  return outputPath;
}
