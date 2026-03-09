import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import os from 'os';

// Types
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    latency: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  version: string;
}

interface DatabaseCheckResult {
  isConnected: boolean;
  latency: number;
}

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Health check service
class HealthCheckService {
  private static async checkDatabase(): Promise<DatabaseCheckResult> {
    const start = Date.now();
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      return {
        isConnected: true,
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        isConnected: false,
        latency: 0,
      };
    }
  }

  private static getMemoryStats() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usage = (used / total) * 100;

    return {
      total,
      used,
      free,
      usage,
    };
  }

  public static async performHealthCheck(): Promise<HealthCheckResponse> {
    const dbCheck = await this.checkDatabase();
    const memoryStats = this.getMemoryStats();

    return {
      status: dbCheck.isConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbCheck.isConnected ? 'connected' : 'disconnected',
        latency: dbCheck.latency,
      },
      memory: memoryStats,
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}

// Express route handler
const healthCheckHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthCheck = await HealthCheckService.performHealthCheck();
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
};

// Router setup
const router = express.Router();
router.get('/health', healthCheckHandler);

export default router;