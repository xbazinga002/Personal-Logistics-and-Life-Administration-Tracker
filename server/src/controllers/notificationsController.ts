import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as notifRepo from '../db/repositories/notificationRepository';

export async function listNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await notifRepo.findAllByUser(req.userId!, unreadOnly);
    const unreadCount = await notifRepo.countUnread(req.userId!);
    res.json({ notifications, unreadCount });
  } catch (err) { next(err); }
}

export async function markRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await notifRepo.markRead(req.params.id, req.userId!);
    if (!updated) { res.status(404).json({ error: 'Notification not found' }); return; }
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function markAllRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await notifRepo.markAllRead(req.userId!);
    res.json({ success: true });
  } catch (err) { next(err); }
}
