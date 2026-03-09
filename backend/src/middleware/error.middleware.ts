import { Request, Response, NextFunction } from 'express';

// Custom error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public stack = ''
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Error interface
interface IError {
  status: string;
  statusCode: number;
  message: string;
  stack?: string;
  errors?: any;
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error 🔥:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'Invalid input data';
    error = new AppError(400, message);
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(400, message);
  }

  // Mongoose CastError (invalid ID)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(404, message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again!';
    error = new AppError(401, message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    error = new AppError(401, message);
  }

  // Create error response
  const errorResponse: IError = {
    status: error instanceof AppError && error.statusCode < 500 ? 'fail' : 'error',
    statusCode: error instanceof AppError ? error.statusCode : 500,
    message: error.message || 'Internal server error',
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send response
  res.status(errorResponse.statusCode).json(errorResponse);
};

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(404, `Route ${req.originalUrl} not found`));
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage example:
/*
app.use(notFound);
app.use(errorHandler);

// In routes:
router.get('/resource', asyncHandler(async (req, res) => {
  throw new AppError(400, 'Bad Request');
}));
*/