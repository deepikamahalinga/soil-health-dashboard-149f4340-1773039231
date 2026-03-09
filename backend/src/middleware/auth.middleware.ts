import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Custom interfaces
interface JwtPayload {
  userId: string;
  email: string;
  // Add other user properties as needed
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Environment variable type check
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Authentication middleware for verifying JWT tokens
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ message: 'No authorization header' });
      return;
    }

    // Check if token format is valid
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ message: 'Invalid authorization format' });
      return;
    }

    const token = parts[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // Attach user to request object
      req.user = decoded;
      
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: 'Token expired' });
        return;
      }
      
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ message: 'Invalid token' });
        return;
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Usage example:
// app.use('/protected-route', authenticate, protectedRouteHandler);