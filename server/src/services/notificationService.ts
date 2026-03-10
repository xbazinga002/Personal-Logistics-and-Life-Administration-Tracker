import * as itemRepo from '../db/repositories/itemRepository';
import * as notifRepo from '../db/repositories/notificationRepository';
import { daysUntilDue } from './urgencyService';

const DUE_SOON_THRESHOLDS = [1, 3, 7]; // days

/**
 * Generates due-soon and overdue notifications for a user.
 * Called on dashboard load. Deduplicates by checking existing notifications for the day.
 */
export async function generateNotificationsForUser(userId: string): Promise<void> {
  // Due soon notifications
  for (const threshold of DUE_SOON_THRESHOLDS) {
    const items = await itemRepo.findItemsDueWithinDays(userId, threshold);
    for (const item of items) {
      const days = daysUntilDue(item.due_date);
      if (days > threshold) continue; // only items exactly within this threshold
      const type = `due_soon_${threshold}d`;
      const alreadyExists = await notifRepo.existsForItem(item.id, type);
      if (!alreadyExists) {
        const dayLabel = days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
        await notifRepo.create({
          user_id: userId,
          item_id: item.id,
          type,
          message: `"${item.title}" is due ${dayLabel}.`,
        });
      }
    }
  }

  // Overdue notifications
  const overdueItems = await itemRepo.findOverdueItems(userId);
  for (const item of overdueItems) {
    const type = 'overdue';
    const alreadyExists = await notifRepo.existsForItem(item.id, type);
    if (!alreadyExists) {
      const days = Math.abs(daysUntilDue(item.due_date));
      await notifRepo.create({
        user_id: userId,
        item_id: item.id,
        type,
        message: `"${item.title}" is overdue by ${days} day${days !== 1 ? 's' : ''}.`,
      });
    }
  }
}
