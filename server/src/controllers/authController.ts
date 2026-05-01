import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as userRepo from '../db/repositories/userRepository';
import * as resetRepo from '../db/repositories/passwordResetRepository';
import { sendPasswordResetEmail } from '../services/emailService';
import { ValidationError, ConflictError, UnauthorizedError } from '../utils/errors';

const BCRYPT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) throw new ValidationError('Email and password are required');
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError('Invalid email format');
    }
    if (typeof password !== 'string' || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const existing = await userRepo.findByEmail(email.toLowerCase());
    if (existing) throw new ConflictError('Email already registered');

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await userRepo.createUser(email.toLowerCase(), hash);

    const token = signToken(user.id);
    res.status(201).json({ userId: user.id, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ValidationError('Email and password are required');

    const user = await userRepo.findByEmail(email.toLowerCase());
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw new UnauthorizedError('Invalid credentials');

    const token = signToken(user.id);
    res.json({ token, userId: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') throw new ValidationError('Email is required');

    const user = await userRepo.findByEmail(email.toLowerCase());
    if (user) {
      await resetRepo.invalidateAllForUser(user.id);
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await resetRepo.create(user.id, tokenHash, expiresAt);

      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;
      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (sendErr) {
        console.error('[forgotPassword] failed to send email:', sendErr);
      }
    }

    res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;
    if (!token || typeof token !== 'string') throw new ValidationError('Token is required');
    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const tokenHash = hashToken(token);
    const record = await resetRepo.findValidByHash(tokenHash);
    if (!record) throw new UnauthorizedError('Invalid or expired reset token');

    const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await resetRepo.updateUserPasswordHash(record.user_id, newHash);
    await resetRepo.markUsed(record.id);
    await resetRepo.invalidateAllForUser(record.user_id);

    res.json({ message: 'Password updated successfully. You can now sign in.' });
  } catch (err) {
    next(err);
  }
}

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'changeme' || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a strong value (>= 32 chars)');
  }
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}
