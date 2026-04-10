import mammoth from 'mammoth';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import fs from 'fs';
import path from 'path';

import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

/**
 * Convert DOCX → PDF using:
 * 1. mammoth: DOCX → HTML (extracts text & basic formatting)
 * 2. PDFKit: Creates a clean PDF from extracted paragraphs
 *
 * Layout fidelity is basic — for perfect conversion, LibreOffice is needed.
 */
export async function wordToPdf(filePath: string): Promise<string> {
  // Step 1: Convert DOCX to plain text with basic structure via mammoth
  const { value: html } = await mammoth.convertToHtml({ path: filePath });

  // Step 2: Parse HTML into paragraphs (simple regex-based parser)
  const paragraphs = parseHtmlToParagraphs(html);

  // Step 3: Create PDF with PDFKit
  const outputPath = path.join(
    config.files.outputDir,
    `converted_${uuidv4()}.pdf`
  );

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 72, // 1 inch margins
      size: 'A4',
    });

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    paragraphs.forEach(({ text, style }) => {
      if (!text.trim()) {
        doc.moveDown(0.5);
        return;
      }

      switch (style) {
        case 'h1':
          doc.fontSize(24).font('Helvetica-Bold').text(text, { align: 'left' });
          doc.moveDown(0.5);
          break;
        case 'h2':
          doc.fontSize(18).font('Helvetica-Bold').text(text, { align: 'left' });
          doc.moveDown(0.4);
          break;
        case 'h3':
          doc.fontSize(14).font('Helvetica-Bold').text(text, { align: 'left' });
          doc.moveDown(0.3);
          break;
        case 'li':
          doc.fontSize(11).font('Helvetica').text(`• ${text}`, {
            align: 'left',
            indent: 20,
          });
          doc.moveDown(0.2);
          break;
        default:
          doc.fontSize(11).font('Helvetica').text(text, { align: 'justify' });
          doc.moveDown(0.3);
      }
    });

    doc.end();
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });

  return outputPath;
}

interface ParsedParagraph {
  text: string;
  style: 'h1' | 'h2' | 'h3' | 'p' | 'li' | 'strong';
}

function parseHtmlToParagraphs(html: string): ParsedParagraph[] {
  const results: ParsedParagraph[] = [];

  // Match heading and paragraph tags with their content
  const tagPattern = /<(h[1-3]|p|li|strong)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = tagPattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase() as ParsedParagraph['style'];
    const rawContent = match[2];
    // Strip inner HTML tags to get plain text
    const text = rawContent.replace(/<[^>]+>/g, '').trim();
    if (text) {
      results.push({ text, style: tag });
    }
  }

  // Fallback: if nothing parsed, use the whole text
  if (results.length === 0) {
    const plainText = html.replace(/<[^>]+>/g, '').trim();
    plainText.split('\n').forEach((line) => {
      if (line.trim()) results.push({ text: line.trim(), style: 'p' });
    });
  }

  return results;
}
