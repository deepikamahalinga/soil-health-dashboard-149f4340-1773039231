// src/lib/db/prisma.ts

import { PrismaClient } from '@prisma/client';
import { Logger } from '../logger'; // Assume you have a logger implementation

// Custom Prisma error types
export interface PrismaErrorHandler {
  code: string;
  message: string;
  meta?: Record<string, any>;
}

// Database configuration interface
interface DatabaseConfig {
  maxConnections?: number;
  minConnections?: number;
  connectionTimeout?: number;
  enableLogging?: boolean;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;
  private isConnected: boolean = false;
  private readonly config: DatabaseConfig;

  private constructor(config: DatabaseConfig = {}) {
    this.config = {
      maxConnections: config.maxConnections || 10,
      minConnections: config.minConnections || 1,
      connectionTimeout: config.connectionTimeout || 30000,
      enableLogging: config.enableLogging || process.env.NODE_ENV === 'development',
    };

    this.prisma = new PrismaClient({
      log: this.config.enableLogging ? ['query', 'error', 'warn'] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Connection pool configuration
      datasourceConfig: {
        poolConfig: {
          max: this.config.maxConnections,
          min: this.config.minConnections,
          idleTimeoutMillis: this.config.connectionTimeout,
        },
      },
    });

    // Error handling middleware
    this.prisma.$use(async (params, next) => {
      try {
        return await next(params);
      } catch (error) {
        this.handleDatabaseError(error);
        throw error;
      }
    });
  }

  // Singleton pattern implementation
  public static getInstance(config?: DatabaseConfig): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService(config);
    }
    return DatabaseService.instance;
  }

  // Initialize database connection
  public async initialize(): Promise<void> {
    try {
      await this.connect();
      Logger.info('Database connection initialized successfully');
    } catch (error) {
      Logger.error('Failed to initialize database connection', error);
      throw error;
    }
  }

  // Connect to database
  public async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.prisma.$connect();
        this.isConnected = true;
        Logger.info('Successfully connected to database');
      }
    } catch (error) {
      Logger.error('Database connection error:', error);
      throw this.handleDatabaseError(error);
    }
  }

  // Disconnect from database
  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.prisma.$disconnect();
        this.isConnected = false;
        Logger.info('Successfully disconnected from database');
      }
    } catch (error) {
      Logger.error('Database disconnection error:', error);
      throw this.handleDatabaseError(error);
    }
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      Logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Get Prisma client instance
  public getClient(): PrismaClient {
    if (!this.isConnected) {
      throw new Error('Database is not connected');
    }
    return this.prisma;
  }

  // Transaction helper
  public async transaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(async (prismaClient) => {
      return await fn(prismaClient);
    });
  }

  // Error handler
  private handleDatabaseError(error: any): PrismaErrorHandler {
    const errorHandler: PrismaErrorHandler = {
      code: 'DATABASE_ERROR',
      message: 'An unexpected database error occurred',
    };

    if (error.code) {
      switch (error.code) {
        case 'P2002':
          errorHandler.code = 'UNIQUE_CONSTRAINT_VIOLATION';
          errorHandler.message = 'Unique constraint violation';
          break;
        case 'P2025':
          errorHandler.code = 'RECORD_NOT_FOUND';
          errorHandler.message = 'Record not found';
          break;
        case 'P2003':
          errorHandler.code = 'FOREIGN_KEY_CONSTRAINT_VIOLATION';
          errorHandler.message = 'Foreign key constraint violation';
          break;
      }
    }

    errorHandler.meta = error.meta || {};
    Logger.error('Database error:', errorHandler);
    return errorHandler;
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();

// Export type for Prisma Client
export type DBClient = PrismaClient;