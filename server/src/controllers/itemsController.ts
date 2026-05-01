import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as itemRepo from '../db/repositories/itemRepository';
import * as categoryRepo from '../db/repositories/categoryRepository';
import * as tagRepo from '../db/repositories/tagRepository';
import { generateNextDueDate, toDateString } from '../services/recurrenceService';
import { computeUrgency } from '../services/urgencyService';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';
import { isValidDate, sanitizeString } from '../middleware/validate';

function addUrgency(item: itemRepo.Item) {
  return { ...item, urgency: computeUrgency(item.due_date, item.status) };
}

async function assertCategoryOwned(categoryId: string | undefined | null, userId: string): Promise<void> {
  if (!categoryId) return;
  const owned = await categoryRepo.existsForUser(categoryId, userId);
  if (!owned) throw new ValidationError('Invalid category_id');
}

async function assertTagsOwned(tagIds: string[] | undefined, userId: string): Promise<void> {
  if (!tagIds || tagIds.length === 0) return;
  const owned = await tagRepo.countOwnedByUser(tagIds, userId);
  if (owned !== tagIds.length) throw new ValidationError('Invalid tag_ids');
}

export async function listItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, category_id, tag_id, due_from, due_to, sort } = req.query as Record<string, string>;
    const safeSort: 'asc' | 'desc' = sort === 'desc' ? 'desc' : 'asc';
    const items = await itemRepo.findAllByUser(req.userId!, { status, category_id, tag_id, due_from, due_to, sort: safeSort });
    res.json(items.map(addUrgency));
  } catch (err) { next(err); }
}

export async function getItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await itemRepo.findByIdAndUser(req.params.id, req.userId!);
    if (!item) throw new NotFoundError('Item');
    res.json(addUrgency(item));
  } catch (err) { next(err); }
}

export async function createItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, notes, due_date, category_id, recurrence_type, recurrence_interval, tag_ids } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) throw new ValidationError('Title is required');
    if (!due_date || !isValidDate(due_date)) throw new ValidationError('A valid due_date (YYYY-MM-DD) is required');

    const validRecurrence = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
    if (recurrence_type && !validRecurrence.includes(recurrence_type)) {
      throw new ValidationError(`recurrence_type must be one of: ${validRecurrence.join(', ')}`);
    }

    const safeTagIds = Array.isArray(tag_ids) ? tag_ids : [];
    await assertCategoryOwned(category_id, req.userId!);
    await assertTagsOwned(safeTagIds, req.userId!);

    const item = await itemRepo.createItem(req.userId!, {
      title: sanitizeString(title),
      notes: notes ? sanitizeString(notes) : undefined,
      due_date,
      category_id: category_id || undefined,
      recurrence_type: recurrence_type || 'none',
      recurrence_interval: recurrence_interval ? parseInt(recurrence_interval) : 1,
      tag_ids: safeTagIds,
    });
    res.status(201).json(addUrgency(item));
  } catch (err) { next(err); }
}

export async function updateItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await itemRepo.findByIdAndUser(req.params.id, req.userId!);
    if (!existing) throw new NotFoundError('Item');

    const { title, notes, due_date, category_id, recurrence_type, recurrence_interval, status, tag_ids } = req.body;

    if (due_date && !isValidDate(due_date)) throw new ValidationError('Invalid due_date format');

    const validStatuses = ['pending', 'completed', 'overdue', 'archived'];
    if (status && !validStatuses.includes(status)) throw new ValidationError('Invalid status');

    const updateData: Parameters<typeof itemRepo.updateItem>[2] = {};
    if (title !== undefined) updateData.title = sanitizeString(title);
    if (notes !== undefined) updateData.notes = sanitizeString(notes);
    if (due_date !== undefined) updateData.due_date = due_date;
    if (category_id !== undefined) {
      await assertCategoryOwned(category_id, req.userId!);
      updateData.category_id = category_id || null;
    }
    if (recurrence_type !== undefined) updateData.recurrence_type = recurrence_type;
    if (recurrence_interval !== undefined) updateData.recurrence_interval = parseInt(recurrence_interval);
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'archived') updateData.archived_at = new Date();
    }
    if (Array.isArray(tag_ids)) {
      await assertTagsOwned(tag_ids, req.userId!);
      updateData.tag_ids = tag_ids;
    }

    const updated = await itemRepo.updateItem(req.params.id, req.userId!, updateData);
    res.json(addUrgency(updated!));
  } catch (err) { next(err); }
}

export async function deleteItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const deleted = await itemRepo.deleteItem(req.params.id, req.userId!);
    if (!deleted) throw new NotFoundError('Item');
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function completeItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await itemRepo.findByIdAndUser(req.params.id, req.userId!);
    if (!item) throw new NotFoundError('Item');
    if (item.status === 'completed') throw new ConflictError('Item is already completed');

    const completedItem = await itemRepo.updateItem(req.params.id, req.userId!, { status: 'completed' });

    let nextItem = null;
    if (item.recurrence_type !== 'none') {
      const duplicate = await itemRepo.findDuplicateRecurrence(item.id);
      if (!duplicate) {
        const nextDue = generateNextDueDate(item.due_date, item.recurrence_type);
        nextItem = await itemRepo.createItem(req.userId!, {
          title: item.title,
          notes: item.notes || undefined,
          due_date: toDateString(nextDue),
          category_id: item.category_id || undefined,
          recurrence_type: item.recurrence_type,
          recurrence_interval: item.recurrence_interval,
          generated_from_item_id: item.id,
        });
      }
    }

    res.json({ completedItem: addUrgency(completedItem!), nextItem: nextItem ? addUrgency(nextItem) : null });
  } catch (err) { next(err); }
}
