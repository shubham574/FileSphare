import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { deleteFiles } from '../utils/cleanup';

// ─── Imports for all services ────────────────────────────────────────────────
import { mergePdfs } from '../services/merge.service';
import { splitPdf } from '../services/split.service';
import { compressPdf } from '../services/compress.service';
import { rotatePdf } from '../services/rotate.service';
import { addWatermark } from '../services/watermark.service';
import { addPageNumbers } from '../services/pageNumbers.service';
import { jpgToPdf } from '../services/jpgToPdf.service';
import { pdfToJpg } from '../services/pdfToJpg.service';
import { pdfToWord } from '../services/pdfToWord.service';
import { wordToPdf } from '../services/wordToPdf.service';
import { addHeaderFooter } from '../services/headerFooter.service';
import { compressImage, convertImage } from '../services/image.service';
import { compressVideo, convertVideo } from '../services/video.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobState {
  jobId: string;
  tool: string;
  status: JobStatus;
  inputFiles: string[];
  outputFile?: string;
  error?: string;
  progress?: number; // 0-100
  options?: Record<string, any>;
  metadata?: Record<string, any>; // tool-specific extra data (e.g. compress stats)
  createdAt: Date;
  updatedAt: Date;
}

// ─── In-memory store (no Redis needed) ───────────────────────────────────────

const jobStore = new Map<string, JobState>();
const jobEmitter = new EventEmitter();

export function getJob(jobId: string): JobState | undefined {
  return jobStore.get(jobId);
}

// ─── Service map ──────────────────────────────────────────────────────────────

// Compress returns a richer result object; all others return a string path
const serviceMap: Record<string, (inputFiles: string[], options: any, onProgress?: (p: number) => void) => Promise<string | { outputPath: string; [key: string]: any }>> = {
  'merge':        (files, _opts, onProgress)      => mergePdfs(files),
  'split':        (files, opts, onProgress)       => splitPdf(files[0], opts),
  'compress':     (files, opts, onProgress)       => compressPdf(files[0], opts),
  'rotate':       (files, opts, onProgress)       => rotatePdf(files[0], opts),
  'watermark':    (files, opts, onProgress)       => addWatermark(files[0], opts),
  'page-numbers': (files, opts, onProgress)       => addPageNumbers(files[0], opts),
  'jpg-to-pdf':   (files, _opts, onProgress)      => jpgToPdf(files),
  'pdf-to-jpg':   (files, _opts, onProgress)      => pdfToJpg(files[0]),
  'pdf-to-word':  (files, _opts, onProgress)      => pdfToWord(files[0]),
  'word-to-pdf':  (files, _opts, onProgress)      => wordToPdf(files[0]),
  'header-footer': (files, opts, onProgress)       => addHeaderFooter(files[0], opts),
  'image-compress': (files, opts, onProgress)      => compressImage(files[0], opts, onProgress),
  'image-convert':  (files, opts, onProgress)      => convertImage(files[0], opts.targetFormat, onProgress),
  'video-compress': (files, opts, onProgress)      => compressVideo(files[0], opts, onProgress),
  'video-convert':  (files, opts, onProgress)      => convertVideo(files[0], opts.targetFormat, onProgress),
};

// ─── Job dispatcher ───────────────────────────────────────────────────────────

function updateJob(jobId: string, patch: Partial<JobState>) {
  const existing = jobStore.get(jobId);
  if (existing) {
    jobStore.set(jobId, { ...existing, ...patch, updatedAt: new Date() });
  }
}

async function runJob(jobId: string) {
  const job = jobStore.get(jobId);
  if (!job) return;

  updateJob(jobId, { status: 'processing' });
  logger.info(`[JobRunner] Processing job ${jobId} — tool: ${job.tool}`);

  const serviceFn = serviceMap[job.tool];
  if (!serviceFn) {
    updateJob(jobId, { status: 'failed', error: `Unknown tool: ${job.tool}` });
    return;
  }

  try {
    const result = await serviceFn(
      job.inputFiles, 
      job.options || {},
      (percent) => updateJob(jobId, { progress: Math.min(Math.round(percent), 100) })
    );

    // Some services (compress) return a rich object; others return a plain string path
    let outputFile: string;
    let metadata: Record<string, any> | undefined;
    if (typeof result === 'string') {
      outputFile = result;
    } else {
      outputFile = result.outputPath;
      const { outputPath: _p, ...rest } = result;
      metadata = rest;
    }

    updateJob(jobId, {
      status: 'completed',
      outputFile,
      metadata,
    });
    logger.info(`[JobRunner] Job ${jobId} completed → ${outputFile}`);

    // Cleanup input files after a delay
    setTimeout(() => deleteFiles(job.inputFiles), 10_000);
  } catch (err: any) {
    const message = err?.message || 'Processing failed';
    logger.error(`[JobRunner] Job ${jobId} failed: ${message}`);
    updateJob(jobId, { status: 'failed', error: message });
    deleteFiles(job.inputFiles);
  }
}

/**
 * Create a job and immediately start processing it in the background.
 * Returns the jobId immediately (202 Accepted pattern).
 */
export function createAndDispatchJob(
  tool: string,
  inputFiles: string[],
  options: Record<string, any> = {}
): string {
  const jobId = uuidv4();
  const now = new Date();

  jobStore.set(jobId, {
    jobId,
    tool,
    status: 'pending',
    inputFiles,
    options,
    createdAt: now,
    updatedAt: now,
  });

  // Fire and forget — run asynchronously
  setImmediate(() => runJob(jobId));

  // Auto-cleanup job from memory after 2 hours
  setTimeout(() => {
    const job = jobStore.get(jobId);
    if (job?.outputFile) {
      try {
        const fs = require('fs');
        if (fs.existsSync(job.outputFile)) fs.unlinkSync(job.outputFile);
      } catch (_) {}
    }
    jobStore.delete(jobId);
  }, 2 * 60 * 60 * 1000);

  return jobId;
}
