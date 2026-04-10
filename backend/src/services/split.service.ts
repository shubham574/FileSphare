import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

interface SplitOptions {
  mode?: 'all' | 'range' | 'fixed';
  ranges?: string; // e.g. "1-3,5,7-9"
  fixedPages?: number; // split every N pages
}

function parseRanges(rangeStr: string, totalPages: number): number[][] {
  const groups: number[][] = [];
  const parts = rangeStr.split(',').map((s) => s.trim());
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      const group: number[] = [];
      for (let i = start; i <= Math.min(end, totalPages); i++) group.push(i - 1);
      if (group.length) groups.push(group);
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n) && n >= 1 && n <= totalPages) groups.push([n - 1]);
    }
  }
  return groups;
}

export async function splitPdf(
  filePath: string,
  options: SplitOptions = {}
): Promise<string> {
  const pdfBytes = fs.readFileSync(filePath);
  const srcPdf = await PDFDocument.load(pdfBytes);
  const totalPages = srcPdf.getPageCount();

  let pageGroups: number[][] = [];

  const mode = options.mode || 'all';
  if (mode === 'range' && options.ranges) {
    pageGroups = parseRanges(options.ranges, totalPages);
  } else if (mode === 'fixed' && options.fixedPages) {
    const n = options.fixedPages;
    for (let i = 0; i < totalPages; i += n) {
      pageGroups.push(
        Array.from({ length: Math.min(n, totalPages - i) }, (_, j) => i + j)
      );
    }
  } else {
    // Default: split each page individually
    pageGroups = Array.from({ length: totalPages }, (_, i) => [i]);
  }

  const tempDir = path.join(config.files.outputDir, `split_${uuidv4()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  const splitFiles: string[] = [];
  for (let i = 0; i < pageGroups.length; i++) {
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(srcPdf, pageGroups[i]);
    pages.forEach((p) => newPdf.addPage(p));
    const bytes = await newPdf.save();
    const outFile = path.join(tempDir, `page_${i + 1}.pdf`);
    fs.writeFileSync(outFile, bytes);
    splitFiles.push(outFile);
  }

  // Zip all split files
  const zipPath = path.join(config.files.outputDir, `split_${uuidv4()}.zip`);
  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 6 } });
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    splitFiles.forEach((f) => archive.file(f, { name: path.basename(f) }));
    archive.finalize();
  });

  // Cleanup temp split dir
  splitFiles.forEach((f) => fs.unlinkSync(f));
  fs.rmdirSync(tempDir);

  return zipPath;
}
