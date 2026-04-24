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
  showLine?: boolean; // Draw separator line below header / above footer
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
    showLine = true,
  } = options;

  // Strip \r from Windows-style \r\n line endings — WinAnsi cannot encode \r (0x000d)
  const cleanHeader = headerText.replace(/\r/g, '');
  const cleanFooter = footerText.replace(/\r/g, '');

  const rgbColor = parseHexToRgb(color);
  const lineThickness = 0.75;
  const lineGap = 6; // gap between text and separator line
  const lineHeight = fontSize * 1.4; // spacing between multi-line text lines
  const allPages = pdfDoc.getPages();
  const selectedIndices = getPageIndices(pages, allPages.length);

  selectedIndices.forEach((idx) => {
    const page = allPages[idx];
    const { width, height } = page.getSize();

    // ─── Draw Header (multi-line) ────────────────────────────────────
    if (cleanHeader.trim()) {
      const lines = cleanHeader.split('\n');
      let yStart = height - margin - fontSize;

      lines.forEach((line, lineIdx) => {
        const trimmedLine = line;
        const textWidth = font.widthOfTextAtSize(trimmedLine, fontSize);
        let x: number;
        const y = yStart - lineIdx * lineHeight;

        switch (headerPosition) {
          case 'top-left': x = margin; break;
          case 'top-right': x = width - margin - textWidth; break;
          case 'top-center':
          default: x = (width - textWidth) / 2; break;
        }

        page.drawText(trimmedLine, {
          x, y, size: fontSize, font,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b), opacity,
        });
      });

      // Draw separator line below last header line
      if (showLine) {
        const lineY = yStart - (lines.length - 1) * lineHeight - lineGap - lineThickness;
        page.drawLine({
          start: { x: margin, y: lineY },
          end: { x: width - margin, y: lineY },
          thickness: lineThickness,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
          opacity: opacity * 0.6,
        });
      }
    }

    // ─── Draw Footer (multi-line) ────────────────────────────────────
    if (cleanFooter.trim()) {
      const lines = cleanFooter.split('\n');
      // Footer lines stack upward from the margin
      const totalTextHeight = (lines.length - 1) * lineHeight;
      let yStart = margin + totalTextHeight;

      lines.forEach((line, lineIdx) => {
        const trimmedLine = line;
        const textWidth = font.widthOfTextAtSize(trimmedLine, fontSize);
        let x: number;
        const y = yStart - lineIdx * lineHeight;

        switch (footerPosition) {
          case 'bottom-left': x = margin; break;
          case 'bottom-right': x = width - margin - textWidth; break;
          case 'bottom-center':
          default: x = (width - textWidth) / 2; break;
        }

        page.drawText(trimmedLine, {
          x, y, size: fontSize, font,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b), opacity,
        });
      });

      // Draw separator line above first footer line
      if (showLine) {
        const lineY = yStart + fontSize + lineGap;
        page.drawLine({
          start: { x: margin, y: lineY },
          end: { x: width - margin, y: lineY },
          thickness: lineThickness,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b),
          opacity: opacity * 0.6,
        });
      }
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
