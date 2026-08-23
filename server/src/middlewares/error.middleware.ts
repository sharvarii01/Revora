import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/responseHelper';
import logger from '../logs/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn(
      { path: req.path, method: req.method, statusCode: err.statusCode, errorCode: err.errorCode },
      err.message
    );
    return sendError(res, err.message, err.statusCode, err.errorCode, err.details);
  }

  logger.error({ err, path: req.path, method: req.method }, '❌ Unhandled Internal Server Error:');
  return sendError(res, 'An unexpected internal error occurred.', 500, 'INTERNAL_SERVER_ERROR');
}
