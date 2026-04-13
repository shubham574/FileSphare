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
  headerFooterController,
} from '../controllers/pdf.controller';

import {
  compressImageController,
  convertImageController,
} from '../controllers/image.controller';

import {
  compressVideoController,
  convertVideoController,
} from '../controllers/video.controller';

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
router.post('/header-footer', uploadLimiter, upload.single('file'),      headerFooterController);

// Image
router.post('/image/compress', uploadLimiter, upload.single('file'),     compressImageController);
router.post('/image/convert',  uploadLimiter, upload.single('file'),     convertImageController);

// Video
router.post('/video/compress', uploadLimiter, upload.single('file'),     compressVideoController);
router.post('/video/convert',  uploadLimiter, upload.single('file'),     convertVideoController);

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
  'header-footer': 'modified.pdf',
};

function getFriendlyName(job: any): string {
  const staticName = toolFilenames[job.tool];
  if (staticName) return staticName;

  // For dynamic tools (compress/convert), use the actual extension from the output file
  if (job.outputFile) {
    const ext = path.extname(job.outputFile);
    const base = job.tool.includes('image') ? 'image' : 
                 job.tool.includes('video') ? 'video' : 'output';
    return `${base}${ext}`;
  }

  return 'output';
}

router.get('/status/:jobId', (req: Request, res: Response, next: NextFunction) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    return next(createError('Job not found. It may have expired.', 404));
  }

  const friendlyName = getFriendlyName(job);

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
    metadata: job.metadata,
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

  const friendlyName = getFriendlyName(job);

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
