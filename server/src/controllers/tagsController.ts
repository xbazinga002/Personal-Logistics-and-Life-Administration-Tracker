import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as tagRepo from '../db/repositories/tagRepository';
import { ValidationError } from '../utils/errors';
import { sanitizeString } from '../middleware/validate';

export async function listTags(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const tags = await tagRepo.findAllByUser(req.userId!);
    res.json(tags);
  } catch (err) { next(err); }
}

export async function createTag(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) throw new ValidationError('Tag name is required');
    const tag = await tagRepo.create(req.userId!, sanitizeString(name));
    res.status(201).json(tag);
  } catch (err) { next(err); }
}

export async function deleteTag(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleted = await tagRepo.deleteTag(req.params.id, req.userId!);
    if (!deleted) { res.status(404).json({ error: 'Tag not found' }); return; }
    res.status(204).send();
  } catch (err) { next(err); }
}
