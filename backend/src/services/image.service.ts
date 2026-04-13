import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import fs from 'fs';

interface ImageCompressOptions {
  quality?: number;
}

export async function compressImage(
  filePath: string,
  options: ImageCompressOptions = {},
  onProgress?: (percent: number) => void
): Promise<{ outputPath: string; originalSize: number; outputSize: number; reductionPercent: number }> {
  if (onProgress) onProgress(10);
  
  const quality = options.quality ?? 80;
  const fileName = `compressed_${uuidv4()}.webp`;
  const outputPath = path.join(config.files.outputDir, fileName);

  const originalSize = fs.statSync(filePath).size;

  await sharp(filePath)
    .webp({ quality })
    .toFile(outputPath);

  if (onProgress) onProgress(90);

  const outputSize = fs.statSync(outputPath).size;
  const reductionPercent = Math.round(((originalSize - outputSize) / originalSize) * 100);

  if (onProgress) onProgress(100);

  return {
    outputPath,
    originalSize,
    outputSize,
    reductionPercent,
  };
}

export async function convertImage(
  filePath: string,
  targetFormat: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (onProgress) onProgress(20);

  const fileName = `converted_${uuidv4()}.${targetFormat}`;
  const outputPath = path.join(config.files.outputDir, fileName);

  const image = sharp(filePath);

  // Apply format-specific optimizations
  switch (targetFormat.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      await image.jpeg({ quality: 90 }).toFile(outputPath);
      break;
    case 'png':
      await image.png({ compressionLevel: 9 }).toFile(outputPath);
      break;
    case 'webp':
      await image.webp({ quality: 85 }).toFile(outputPath);
      break;
    case 'avif':
      await image.avif({ quality: 65 }).toFile(outputPath);
      break;
    default:
      await image.toFile(outputPath);
  }

  if (onProgress) onProgress(100);
  return outputPath;
}
