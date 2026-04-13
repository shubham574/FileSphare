import { Request, Response, NextFunction } from 'express';
import { createAndDispatchJob } from '../queues/jobRunner';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

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

export async function compressImageController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload an image file.', 400));

  const options = {
    quality: parseInt(req.body.quality || '80', 10),
  };

  dispatch('image-compress', [file.path], options, req, res);
}

export async function convertImageController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload an image file.', 400));

  const targetFormat = req.body.targetFormat || 'webp';
  if (!['jpeg', 'png', 'webp', 'avif'].includes(targetFormat)) {
    return next(createError('Unsupported target format.', 400));
  }

  dispatch('image-convert', [file.path], { targetFormat }, req, res);
}
