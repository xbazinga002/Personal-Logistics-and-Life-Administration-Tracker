import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as itemRepo from '../db/repositories/itemRepository';
import { generateNotificationsForUser } from '../services/notificationService';
import { computeUrgency } from '../services/urgencyService';

function addUrgency(item: itemRepo.Item) {
  return { ...item, urgency: computeUrgency(item.due_date, item.status) };
}

export async function getSummary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    // Generate notifications lazily on each dashboard load
    await generateNotificationsForUser(req.userId!);

    const { overdue, dueSoon, upcoming } = await itemRepo.getDashboardSummary(req.userId!);
    res.json({
      overdue: overdue.map(addUrgency),
      dueSoon: dueSoon.map(addUrgency),
      upcoming: upcoming.map(addUrgency),
      counts: {
        overdue: overdue.length,
        dueSoon: dueSoon.length,
        upcoming: upcoming.length,
      },
    });
  } catch (err) { next(err); }
}
