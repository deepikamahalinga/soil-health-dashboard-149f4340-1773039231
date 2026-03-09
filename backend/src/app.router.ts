// src/config/app.ts

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { validateEnv } from './validateEnv';
import { errorHandler } from '../middleware/errorHandler';
import { requestLogger } from '../middleware/requestLogger';
import { soilReportRouter } from '../routes/soilReport.routes';
import { healthRouter } from '../routes/health.routes';
import { configureSwagger } from './swagger';

// Environment validation
validateEnv();

// Initialize services
export const prisma = new PrismaClient();
export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  });
  app.use('/api', limiter);

  // General middleware
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  // API Documentation
  configureSwagger(app);

  // Health check
  app.use('/health', healthRouter);

  // API Routes
  app.use('/api/soil-records', soilReportRouter);

  // Error handling
  app.use(errorHandler);

  // Database connection check
  prisma.$connect()
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error('Database connection error:', err));

  // Redis connection check
  redis.on('connect', () => console.log('Redis connected successfully'));
  redis.on('error', (err) => console.error('Redis connection error:', err));

  return app;
};

// Cleanup function for graceful shutdown
export const cleanup = async (): Promise<void> => {
  await prisma.$disconnect();
  await redis.quit();
};

export default createApp;