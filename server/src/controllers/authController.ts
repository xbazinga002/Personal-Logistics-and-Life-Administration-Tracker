import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userRepo from '../db/repositories/userRepository';
import { ValidationError, ConflictError, UnauthorizedError } from '../utils/errors';

const BCRYPT_ROUNDS = 10;

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

function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'changeme' || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a strong value (>= 32 chars)');
  }
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}
