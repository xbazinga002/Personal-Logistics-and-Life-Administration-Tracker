import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

export function requireFields(fields: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const missing = fields.filter((f) => !req.body[f] && req.body[f] !== 0);
    if (missing.length > 0) {
      return next(new ValidationError(`Missing required fields: ${missing.join(', ')}`));
    }
    next();
  };
}

export function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, 2000);
}

export function isValidDate(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}
