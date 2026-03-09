import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { z } from 'zod';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

import { errorHandler } from './middleware/errorHandler';
import { validateRequest } from './middleware/validateRequest';
import { logger } from './utils/logger';
import { swaggerSpec } from './utils/swagger';
import { soilReportRouter } from './routes/soilReport.routes';
import { AppError } from './utils/appError';
import { config } from './config';

const app: Express = express();
const prisma = new PrismaClient();
const redis = new Redis(config.redis.url);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(compression());
app.use(morgan('combined'));
app.use('/api', limiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/soil-reports', soilReportRouter);

// 404 Handler
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

// Initialize Server
const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

// Graceful Shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  server.close(async () => {
    try {
      await prisma.$disconnect();
      await redis.quit();
      logger.info('Server closed successfully');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  shutdown();
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  shutdown();
});

export default app;