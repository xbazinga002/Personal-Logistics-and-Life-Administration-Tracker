import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    const token = header.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'changeme' || secret.length < 32) {
      throw new Error('JWT_SECRET must be set to a strong value (>= 32 chars)');
    }
    const payload = jwt.verify(token, secret) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      next(err);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}
