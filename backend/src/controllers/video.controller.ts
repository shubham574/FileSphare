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

export async function compressVideoController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload a video file.', 400));

  // Map quality preset to CRF
  const quality = req.body.quality || 'balanced';
  let crf = 23;
  let preset = 'medium';

  if (quality === 'best') {
    crf = 18;
    preset = 'slow';
  } else if (quality === 'small') {
    crf = 28;
    preset = 'faster';
  }

  dispatch('video-compress', [file.path], { crf, preset }, req, res);
}

export async function convertVideoController(req: Request, res: Response, next: NextFunction) {
  const file = req.file;
  if (!file) return next(createError('Upload a video file.', 400));

  const targetFormat = req.body.targetFormat || 'mp4';
  if (!['mp4', 'webm', 'mov', 'avi', 'mkv', 'gif'].includes(targetFormat)) {
    return next(createError('Unsupported target format.', 400));
  }

  dispatch('video-convert', [file.path], { targetFormat }, req, res);
}
