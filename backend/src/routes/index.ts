import { Router, Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { upload } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';
import { createError } from '../middleware/errorHandler';
import { getJob } from '../queues/jobRunner';

import {
  mergeController,
  splitController,
  compressController,
  rotateController,
  watermarkController,
  pageNumbersController,
  jpgToPdfController,
  pdfToJpgController,
  pdfToWordController,
  wordToPdfController,
} from '../controllers/pdf.controller';

const router = Router();

// ─── PDF Tool Endpoints ────────────────────────────────────────────────────

router.post('/merge',        uploadLimiter, upload.array('files', 20),  mergeController);
router.post('/split',        uploadLimiter, upload.single('file'),       splitController);
router.post('/compress',     uploadLimiter, upload.single('file'),       compressController);
router.post('/rotate',       uploadLimiter, upload.single('file'),       rotateController);
router.post('/watermark',    uploadLimiter, upload.single('file'),       watermarkController);
router.post('/page-numbers', uploadLimiter, upload.single('file'),       pageNumbersController);
router.post('/jpg-to-pdf',   uploadLimiter, upload.array('files', 50),  jpgToPdfController);
router.post('/pdf-to-jpg',   uploadLimiter, upload.single('file'),       pdfToJpgController);
router.post('/pdf-to-word',  uploadLimiter, upload.single('file'),       pdfToWordController);
router.post('/word-to-pdf',  uploadLimiter, upload.single('file'),       wordToPdfController);

// ─── Job Status (in-memory) ────────────────────────────────────────────────

// Maps tool names to human-friendly output filenames
const toolFilenames: Record<string, string> = {
  'merge':        'merged.pdf',
  'split':        'split_pages.zip',
  'compress':     'compressed.pdf',
  'rotate':       'rotated.pdf',
  'watermark':    'watermarked.pdf',
  'page-numbers': 'numbered.pdf',
  'jpg-to-pdf':   'images.pdf',
  'pdf-to-jpg':   'pdf_pages.zip',
  'pdf-to-word':  'converted.docx',
  'word-to-pdf':  'converted.pdf',
};

router.get('/status/:jobId', (req: Request, res: Response, next: NextFunction) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    return next(createError('Job not found. It may have expired.', 404));
  }

  const friendlyName = toolFilenames[job.tool] || path.basename(job.outputFile || 'output');

  res.json({
    success: true,
    jobId: job.jobId,
    status: job.status,
    tool: job.tool,
    error: job.error,
    fileName: job.status === 'completed' ? friendlyName : undefined,
    downloadUrl: job.status === 'completed'
      ? `/api/download/${job.jobId}`
      : undefined,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });
});

// ─── Download ─────────────────────────────────────────────────────────────

router.get('/download/:jobId', (req: Request, res: Response, next: NextFunction) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    return next(createError('Job not found. It may have expired.', 404));
  }
  if (job.status !== 'completed') {
    return next(createError(`Job not ready. Current status: ${job.status}`, 400));
  }
  if (!job.outputFile || !fs.existsSync(job.outputFile)) {
    return next(createError('Output file not found. It may have been cleaned up.', 404));
  }

  // Use a friendly, user-readable filename with the correct extension
  const friendlyName = toolFilenames[job.tool] || path.basename(job.outputFile);

  // res.download() sets Content-Disposition: attachment + correct Content-Type automatically
  res.download(path.resolve(job.outputFile), friendlyName, (err) => {
    if (err && !res.headersSent) {
      next(createError('Failed to send file.', 500));
    }
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'FileSphere API is running',
    timestamp: new Date(),
    mode: 'in-memory',
  });
});

export default router;
