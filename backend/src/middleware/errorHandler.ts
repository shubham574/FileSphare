import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function createError(message: string, statusCode = 400): AppError {
  const err: AppError = new Error(message);
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 100}MB.`;
    } else {
      message = `Upload error: ${err.message}`;
    }
  }

  // Log non-operational (unexpected) errors
  if (!err.isOperational) {
    logger.error('Unexpected error:', err);
  } else {
    logger.warn(`Operational error [${statusCode}]: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
