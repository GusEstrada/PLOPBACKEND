import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const correlationId = uuidv4();
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[level]({
      correlationId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.getHeader('content-length') || 0,
      userAgent: req.headers['user-agent'] || '-',
    }, `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
}
