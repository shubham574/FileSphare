import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export async function jpgToPdf(imagePaths: string[]): Promise<string> {
  const pdfDoc = await PDFDocument.create();

  for (const imgPath of imagePaths) {
    const ext = path.extname(imgPath).toLowerCase();
    let imageBytes: Buffer;

    // Normalize all images to JPEG via sharp for consistency
    imageBytes = await sharp(imgPath)
      .jpeg({ quality: 90 })
      .toBuffer();

    const image = await pdfDoc.embedJpg(imageBytes);
    const { width, height } = image.scale(1);

    // Use A4 page and scale image to fit
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const scale = Math.min(pageWidth / width, pageHeight / height, 1);

    const scaledWidth = width * scale;
    const scaledHeight = height * scale;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(image, {
      x: (pageWidth - scaledWidth) / 2,
      y: (pageHeight - scaledHeight) / 2,
      width: scaledWidth,
      height: scaledHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(
    config.files.outputDir,
    `images_to_pdf_${uuidv4()}.pdf`
  );
  fs.writeFileSync(outputPath, pdfBytes);

  return outputPath;
}
