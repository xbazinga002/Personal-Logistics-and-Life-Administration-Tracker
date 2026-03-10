import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as categoryRepo from '../db/repositories/categoryRepository';
import { ValidationError } from '../utils/errors';
import { sanitizeString } from '../middleware/validate';

export async function listCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await categoryRepo.findAllByUser(req.userId!);
    res.json(categories);
  } catch (err) { next(err); }
}

export async function createCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) throw new ValidationError('Category name is required');
    const category = await categoryRepo.create(req.userId!, sanitizeString(name));
    res.status(201).json(category);
  } catch (err) { next(err); }
}

export async function deleteCategory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleted = await categoryRepo.deleteCategory(req.params.id, req.userId!);
    if (!deleted) { res.status(404).json({ error: 'Category not found' }); return; }
    res.status(204).send();
  } catch (err) { next(err); }
}
