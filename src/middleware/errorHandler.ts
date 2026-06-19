import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { env } from '../config/environment';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = req.headers['x-correlation-id'] as string || '-';

  logger.error({
    correlationId,
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
  }, `Error: ${err.message}`);

  res.status(500).json({
    error: env.nodeEnv === 'production' ? 'Error interno del servidor' : err.message,
  });
}
