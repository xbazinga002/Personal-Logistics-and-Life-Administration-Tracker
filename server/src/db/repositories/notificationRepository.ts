import db from '../knex';

export interface Notification {
  id: string;
  user_id: string;
  item_id: string | null;
  type: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

export async function findAllByUser(userId: string, unreadOnly = false): Promise<Notification[]> {
  let query = db('notifications').where({ user_id: userId }).orderBy('created_at', 'desc');
  if (unreadOnly) query = query.where({ is_read: false });
  return query;
}

export async function create(data: {
  user_id: string;
  item_id?: string;
  type: string;
  message: string;
}): Promise<Notification> {
  const [notification] = await db('notifications').insert(data).returning('*');
  return notification;
}

export async function markRead(id: string, userId: string): Promise<boolean> {
  const count = await db('notifications').where({ id, user_id: userId }).update({ is_read: true });
  return count > 0;
}

export async function markAllRead(userId: string): Promise<void> {
  await db('notifications').where({ user_id: userId }).update({ is_read: true });
}

export async function existsForItem(itemId: string, type: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const row = await db('notifications')
    .where({ item_id: itemId, type })
    .where('created_at', '>=', today.toISOString())
    .where('created_at', '<', tomorrow.toISOString())
    .first();
  return !!row;
}

export async function countUnread(userId: string): Promise<number> {
  const [{ count }] = await db('notifications').where({ user_id: userId, is_read: false }).count('id as count');
  return parseInt(String(count), 10);
}
