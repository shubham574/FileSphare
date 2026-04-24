import { Request, Response, NextFunction } from 'express';
import { createAndDispatchJob } from '../queues/jobRunner';
import { createError } from '../middleware/errorHandler';
import { validatePdf } from '../utils/fileValidator';
import { logger } from '../utils/logger';

// ─── Shared dispatcher ─────────────────────────────────────────────────────

function dispatch(
  tool: string,
  inputFiles: string[],
  options: Record<string, any>,
  req: Request,
  res: Response
) {
  const jobId = createAndDispatchJob(tool, inputFiles, options);
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  logger.info(`Dispatched job ${jobId} for tool: ${tool}`);

  res.status(202).json({
    success: true,
    jobId,
    status: 'pending',
    message: 'Job queued. Poll /api/status/:jobId for updates.',
    statusUrl: `${baseUrl}/api/status/${jobId}`,
    downloadUrl: `${baseUrl}/api/download/${jobId}`,
  });
}

// ─── Merge ─────────────────────────────────────────────────────────────────

export async function mergeController(req: Request, res: Response, next: NextFunction) {
  const files = req.files as any[];
  if (!files || files.length < 2) {
    return next(createError('Upload at least 2 PDF files.', 400));
  }

  const filePaths = files.map((f) => f.path);
  for (const fp of filePaths) {
    if (!(await validatePdf(fp))) {
      return next(createError(`File is not a valid PDF: ${fp}`, 400));
    }
  }

  dispatch('merge', filePaths, {}, req, res);
}

// ─── Split ─────────────────────────────────────────────────────────────────

export async function splitController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload a PDF file.', 400));
  if (!(await validatePdf(file.path))) return next(createError('Invalid PDF file.', 400));

  const options = {
    mode: req.body.mode || 'all',
    ranges: req.body.ranges,
    fixedPages: req.body.fixedPages ? parseInt(req.body.fixedPages, 10) : undefined,
  };

  dispatch('split', [file.path], options, req, res);
}

// ─── Compress ────────────────────────────────────────────────────────────

export async function compressController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload a PDF file.', 400));
  if (!(await validatePdf(file.path))) return next(createError('Invalid PDF file.', 400));

  const validLevels = ['low', 'medium', 'high'];
  const level = validLevels.includes(req.body.level) ? req.body.level : 'medium';

  dispatch('compress', [file.path], { level }, req, res);
}

// ─── Rotate ──────────────────────────────────────────────────────────────

export async function rotateController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload a PDF file.', 400));
  if (!(await validatePdf(file.path))) return next(createError('Invalid PDF file.', 400));

  const deg = parseInt(req.body.degrees || '90', 10);
  if (![90, 180, 270].includes(deg)) {
    return next(createError('degrees must be 90, 180, or 270.', 400));
  }

  dispatch('rotate', [file.path], { degrees: deg, pages: 'all' }, req, res);
}

// ─── Watermark ────────────────────────────────────────────────────────────

export async function watermarkController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload a PDF file.', 400));
  if (!(await validatePdf(file.path))) return next(createError('Invalid PDF file.', 400));

  const options = {
    text: req.body.text || 'CONFIDENTIAL',
    opacity: parseFloat(req.body.opacity || '0.2'),
    fontSize: parseInt(req.body.fontSize || '60', 10),
    rotation: parseInt(req.body.rotation || '45', 10),
  };

  dispatch('watermark', [file.path], options, req, res);
}

// ─── Page Numbers ─────────────────────────────────────────────────────────

export async function pageNumbersController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload a PDF file.', 400));
  if (!(await validatePdf(file.path))) return next(createError('Invalid PDF file.', 400));

  const options = {
    position: req.body.position || 'bottom-center',
    fontSize: parseInt(req.body.fontSize || '12', 10),
    startNumber: parseInt(req.body.startNumber || '1', 10),
    format: req.body.format || 'Page n',
  };

  dispatch('page-numbers', [file.path], options, req, res);
}

// ─── JPG to PDF ──────────────────────────────────────────────────────────

export async function jpgToPdfController(req: Request, res: Response, next: NextFunction) {
  const files = req.files as any[];
  if (!files || files.length === 0) {
    return next(createError('Upload at least one image file.', 400));
  }

  dispatch('jpg-to-pdf', files.map((f) => f.path), {}, req, res);
}

// ─── PDF to JPG ──────────────────────────────────────────────────────────

export async function pdfToJpgController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload a PDF file.', 400));
  if (!(await validatePdf(file.path))) return next(createError('Invalid PDF file.', 400));

  dispatch('pdf-to-jpg', [file.path], {}, req, res);
}

// ─── PDF to Word ──────────────────────────────────────────────────────────

export async function pdfToWordController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload a PDF file.', 400));
  if (!(await validatePdf(file.path))) return next(createError('Invalid PDF file.', 400));

  dispatch('pdf-to-word', [file.path], {}, req, res);
}

// ─── Word to PDF ──────────────────────────────────────────────────────────

export async function wordToPdfController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload a DOCX file.', 400));

  dispatch('word-to-pdf', [file.path], {}, req, res);
}

// ─── Header & Footer ──────────────────────────────────────────────────────

export async function headerFooterController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload a PDF file.', 400));
  if (!(await validatePdf(file.path))) return next(createError('Invalid PDF file.', 400));

  const options = {
    headerText: req.body.headerText || '',
    headerPosition: req.body.headerPosition || 'top-center',
    footerText: req.body.footerText || '',
    footerPosition: req.body.footerPosition || 'bottom-center',
    pages: req.body.pages || 'all',
    fontSize: parseInt(req.body.fontSize || '12', 10),
    color: req.body.color || '#000000',
    opacity: parseFloat(req.body.opacity || '1.0'),
    margin: parseInt(req.body.margin || '36', 10),
    showLine: req.body.showLine !== 'false',
  };

  dispatch('header-footer', [file.path], options, req, res);
}
