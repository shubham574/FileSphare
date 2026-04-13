import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { logger } from '../utils/logger';

// Set ffmpeg paths
if (ffmpegStatic) ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

interface VideoOptions {
  preset?: 'fast' | 'medium' | 'slow';
  crf?: number; // 0-51, lower is better quality. 23 is default, 18 is visually lossless.
  targetFormat?: string;
}

export async function compressVideo(
  filePath: string,
  options: VideoOptions = {},
  onProgress?: (percent: number) => void
): Promise<string> {
  const crf = options.crf ?? 23;
  const preset = options.preset ?? 'medium';
  const fileName = `compressed_${uuidv4()}.mp4`; 
  const outputPath = path.join(config.files.outputDir, fileName);

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions([
        '-c:v libx264',
        `-crf ${crf}`,
        `-preset ${preset}`,
        '-c:a aac',
        '-b:a 128k',
        '-movflags +faststart'
      ])
      .on('progress', (progress) => {
        if (progress.percent && onProgress) {
          onProgress(progress.percent);
        }
      })
      .on('end', () => {
        if (onProgress) onProgress(100);
        resolve(outputPath);
      })
      .on('error', (err) => {
        logger.error(`FFMPEG Error: ${err.message}`);
        reject(err);
      })
      .save(outputPath);
  });
}

export async function convertVideo(
  filePath: string,
  targetFormat: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const fileName = `converted_${uuidv4()}.${targetFormat}`;
  const outputPath = path.join(config.files.outputDir, fileName);

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .toFormat(targetFormat)
      .on('progress', (progress) => {
        if (progress.percent && onProgress) {
          onProgress(progress.percent);
        }
      })
      .on('end', () => {
        if (onProgress) onProgress(100);
        resolve(outputPath);
      })
      .on('error', (err) => {
        logger.error(`FFMPEG Error: ${err.message}`);
        reject(err);
      })
      .save(outputPath);
  });
}
