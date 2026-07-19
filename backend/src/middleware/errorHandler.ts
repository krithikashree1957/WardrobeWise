import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

/**
 * Centralised error-handling middleware. Must be registered last.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
    return;
  }

  // Mongoose validation errors
  if (err && typeof err === 'object' && 'name' in err && (err as any).name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: (err as any).errors,
    });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('[unhandled error]', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
