import fs from 'fs';
import path from 'path';
import cron from 'node-cron';
import { config } from '../config';
import { logger } from './logger';

/**
 * Delete a single file safely (no-op if already gone)
 */
export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug(`Deleted file: ${filePath}`);
    }
  } catch (err) {
    logger.warn(`Failed to delete file ${filePath}: ${(err as Error).message}`);
  }
}

/**
 * Delete a list of files safely
 */
export function deleteFiles(filePaths: string[]): void {
  filePaths.forEach(deleteFile);
}

/**
 * Remove files older than TTL minutes from a directory
 */
function cleanDirectory(dir: string, ttlMinutes: number): void {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  const now = Date.now();
  const ttlMs = ttlMinutes * 60 * 1000;

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > ttlMs) {
        fs.unlinkSync(filePath);
        logger.debug(`Cleaned up old file: ${filePath}`);
      }
    } catch (err) {
      logger.warn(`Cleanup error for ${filePath}: ${(err as Error).message}`);
    }
  });
}

/**
 * Schedule periodic cleanup of uploads and outputs directories
 */
export function scheduleCleanup(): void {
  const intervalMinutes = config.cleanup.intervalMinutes;
  const ttlMinutes = config.cleanup.fileTtlMinutes;

  // Run every N minutes using cron
  const cronExpression = `*/${intervalMinutes} * * * *`;

  cron.schedule(cronExpression, () => {
    logger.info('Running scheduled file cleanup...');
    cleanDirectory(config.files.uploadDir, ttlMinutes);
    cleanDirectory(config.files.outputDir, ttlMinutes);
    logger.info('Scheduled cleanup complete.');
  });

  logger.info(`File cleanup scheduled every ${intervalMinutes} minutes (TTL: ${ttlMinutes}min)`);
}
