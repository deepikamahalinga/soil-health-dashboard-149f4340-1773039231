// middleware/requestLogger.ts
import express from 'express';
import morgan from 'morgan';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Custom token for response time
morgan.token('responseTime', (req: any) => {
  if (!req._startTime) return '';
  const diff = process.hrtime(req._startTime);
  return (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
});

// Custom token for request ID
morgan.token('requestId', (req: any) => req.requestId);

// Request ID middleware
export const requestId = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  req.requestId = uuidv4();
  next();
};

// Custom format string
const morganFormat = ':requestId :method :url :status :responseTime ms';

// Main logging middleware
export const requestLogger = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // Start timer
  req._startTime = process.hrtime();

  // Log request
  logger.info({
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    timestamp: new Date().toISOString(),
  });

  // Use Morgan for HTTP logging
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  })(req, res, next);

  // Log response
  res.on('finish', () => {
    const duration = process.hrtime(req._startTime);
    const durationMs = (duration[0] * 1e3 + duration[1] * 1e-6).toFixed(2);

    logger.info({
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${durationMs}ms`,
      timestamp: new Date().toISOString(),
    });
  });
};

// Error logging middleware
export const errorLogger = (
  error: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  logger.error({
    requestId: req.requestId,
    error: {
      message: error.message,
      stack: error.stack,
    },
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
  });
  next(error);
};

// Types
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      _startTime: [number, number];
    }
  }
}