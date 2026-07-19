import { NextFunction, Request, Response } from 'express';

/**
 * Wraps async route handlers so thrown errors / rejected promises
 * are forwarded to Express's error-handling middleware instead of
 * crashing the process.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
