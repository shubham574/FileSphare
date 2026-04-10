import pdfParse from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

export async function pdfToWord(filePath: string): Promise<string> {
  const pdfBuffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(pdfBuffer);

  const rawText = parsed.text || '';
  const lines = rawText.split('\n').filter((l) => l.trim().length > 0);

  // Build DOCX paragraphs from extracted lines
  const paragraphs = lines.map((line) => {
    const trimmed = line.trim();

    // Heuristic: short lines in ALL CAPS → treat as heading
    const isHeading =
      trimmed.length < 60 &&
      trimmed === trimmed.toUpperCase() &&
      trimmed.length > 3;

    if (isHeading) {
      return new Paragraph({
        text: trimmed,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      });
    }

    return new Paragraph({
      children: [
        new TextRun({
          text: trimmed,
          size: 24, // 12pt
        }),
      ],
      spacing: { before: 80, after: 80 },
    });
  });

  // Add metadata paragraph at the top
  const metaParagraph = new Paragraph({
    children: [
      new TextRun({
        text: `Converted from PDF — ${parsed.numpages} page(s), ${lines.length} lines extracted`,
        italics: true,
        color: '888888',
        size: 20,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [metaParagraph, ...paragraphs],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(
    config.files.outputDir,
    `converted_${uuidv4()}.docx`
  );
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}
