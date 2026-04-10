import { fromBuffer } from 'file-type';
import fs from 'fs';

const ALLOWED_PDF_MIME = 'application/pdf';
const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export async function validatePdf(filePath: string): Promise<boolean> {
  try {
    const buffer = fs.readFileSync(filePath).slice(0, 4100);
    const type = await fromBuffer(buffer);
    return !!type && type.mime === ALLOWED_PDF_MIME;
  } catch {
    return false;
  }
}

export async function validateImage(filePath: string): Promise<boolean> {
  try {
    const buffer = fs.readFileSync(filePath).slice(0, 4100);
    const type = await fromBuffer(buffer);
    return !!type && ALLOWED_IMAGE_MIMES.includes(type.mime);
  } catch {
    return false;
  }
}

export async function validateDocx(filePath: string): Promise<boolean> {
  try {
    const buffer = fs.readFileSync(filePath).slice(0, 4100);
    const type = await fromBuffer(buffer);
    return !!type && type.mime === ALLOWED_DOCX_MIME;
  } catch {
    return false;
  }
}

export function getFileSizeMb(filePath: string): number {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
}
