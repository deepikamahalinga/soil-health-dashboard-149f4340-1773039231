import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

interface ValidationMiddlewareOptions {
  source?: 'body' | 'query' | 'params' | 'all';
}

/**
 * Creates a validation middleware using Zod schema
 * @param schema Zod schema to validate against
 * @param options Configuration options for validation
 */
export const validate = (
  schema: AnyZodObject,
  options: ValidationMiddlewareOptions = { source: 'body' }
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate: any;

      switch (options.source) {
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        case 'all':
          dataToValidate = {
            body: req.body,
            query: req.query,
            params: req.params,
          };
          break;
        default:
          dataToValidate = req.body;
      }

      const validatedData = await schema.parseAsync(dataToValidate);

      // Attach validated data to request object
      if (options.source === 'all') {
        req.body = validatedData.body;
        req.query = validatedData.query;
        req.params = validatedData.params;
      } else {
        switch (options.source) {
          case 'query':
            req.query = validatedData;
            break;
          case 'params':
            req.params = validatedData;
            break;
          default:
            req.body = validatedData;
        }
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Example usage types
interface ValidationResponse {
  status: string;
  message: string;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}

// Type for validated request
export type ValidatedRequest<T> = Request & {
  validatedData: T;
};