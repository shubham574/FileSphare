import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

interface WatermarkOptions {
  text?: string;
  opacity?: number; // 0-1, default 0.3
  fontSize?: number; // default 60
  color?: { r: number; g: number; b: number }; // default gray
  rotation?: number; // degrees, default 45
}

export async function addWatermark(
  filePath: string,
  options: WatermarkOptions = {}
): Promise<string> {
  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const text = options.text || 'WATERMARK';
  const opacity = options.opacity ?? 0.2;
  const fontSize = options.fontSize ?? 60;
  const colorOpts = options.color ?? { r: 0.7, g: 0.7, b: 0.7 };
  const rotation = options.rotation ?? 45;

  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2 - fontSize / 2,
      size: fontSize,
      font,
      color: rgb(colorOpts.r, colorOpts.g, colorOpts.b),
      opacity,
      rotate: degrees(rotation),
    });
  });

  const watermarkedBytes = await pdfDoc.save();
  const outputPath = path.join(
    config.files.outputDir,
    `watermarked_${uuidv4()}.pdf`
  );
  fs.writeFileSync(outputPath, watermarkedBytes);

  return outputPath;
}
