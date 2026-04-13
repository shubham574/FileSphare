import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

interface HeaderFooterOptions {
  headerText?: string;
  headerPosition?: 'top-left' | 'top-center' | 'top-right';
  footerText?: string;
  footerPosition?: 'bottom-left' | 'bottom-center' | 'bottom-right';
  pages?: string; // "all" or range like "1-3,5"
  fontSize?: number;
  color?: string; // Hex string e.g. "#ff0000"
  opacity?: number;
  margin?: number;
}

function parseHexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

function getPageIndices(pagesStr: string, totalPages: number): number[] {
  if (!pagesStr || pagesStr.toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const indices = new Set<number>();
  const parts = pagesStr.split(',').map(s => s.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= Math.min(end, totalPages); i++) {
          if (i >= 1) indices.add(i - 1);
        }
      }
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= totalPages) {
        indices.add(n - 1);
      }
    }
  }
  return Array.from(indices).sort((a, b) => a - b);
}

export async function addHeaderFooter(
  filePath: string,
  options: HeaderFooterOptions = {}
): Promise<string> {
  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const {
    headerText = '',
    headerPosition = 'top-center',
    footerText = '',
    footerPosition = 'bottom-center',
    pages = 'all',
    fontSize = 12,
    color = '#000000',
    opacity = 1.0,
    margin = 36, // ~0.5 inch
  } = options;

  const rgbColor = parseHexToRgb(color);
  const allPages = pdfDoc.getPages();
  const selectedIndices = getPageIndices(pages, allPages.length);

  selectedIndices.forEach((idx) => {
    const page = allPages[idx];
    const { width, height } = page.getSize();

    // Draw Header if text exists
    if (headerText.trim()) {
      const textWidth = font.widthOfTextAtSize(headerText, fontSize);
      let x: number;
      let y = height - margin - fontSize;

      switch (headerPosition) {
        case 'top-left': x = margin; break;
        case 'top-right': x = width - margin - textWidth; break;
        case 'top-center':
        default: x = (width - textWidth) / 2; break;
      }

      page.drawText(headerText, {
        x, y, size: fontSize, font, color: rgb(rgbColor.r, rgbColor.g, rgbColor.b), opacity,
      });
    }

    // Draw Footer if text exists
    if (footerText.trim()) {
      const textWidth = font.widthOfTextAtSize(footerText, fontSize);
      let x: number;
      let y = margin;

      switch (footerPosition) {
        case 'bottom-left': x = margin; break;
        case 'bottom-right': x = width - margin - textWidth; break;
        case 'bottom-center':
        default: x = (width - textWidth) / 2; break;
      }

      page.drawText(footerText, {
        x, y, size: fontSize, font, color: rgb(rgbColor.r, rgbColor.g, rgbColor.b), opacity,
      });
    }
  });

  const modifiedBytes = await pdfDoc.save();
  const outputPath = path.join(
    config.files.outputDir,
    `headerfooter_${uuidv4()}.pdf`
  );
  fs.writeFileSync(outputPath, modifiedBytes);

  return outputPath;
}
