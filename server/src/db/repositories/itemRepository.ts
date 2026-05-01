import db from '../knex';

export interface Item {
  id: string;
  user_id: string;
  category_id: string | null;
  generated_from_item_id: string | null;
  title: string;
  notes: string | null;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue' | 'archived';
  recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrence_interval: number;
  archived_at: Date | null;
  created_at: Date;
  tags?: Tag[];
  category_name?: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface ItemFilters {
  status?: string;
  category_id?: string;
  tag_id?: string;
  due_from?: string;
  due_to?: string;
  sort?: 'asc' | 'desc';
}

async function attachTags(items: Item[]): Promise<Item[]> {
  if (items.length === 0) return items;
  const ids = items.map((i) => i.id);
  const itemTags = await db('item_tags')
    .join('tags', 'item_tags.tag_id', 'tags.id')
    .whereIn('item_tags.item_id', ids)
    .select('item_tags.item_id', 'tags.id', 'tags.name');

  const tagMap: Record<string, Tag[]> = {};
  for (const row of itemTags) {
    if (!tagMap[row.item_id]) tagMap[row.item_id] = [];
    tagMap[row.item_id].push({ id: row.id, name: row.name });
  }
  return items.map((item) => ({ ...item, tags: tagMap[item.id] || [] }));
}

export async function findAllByUser(userId: string, filters: ItemFilters = {}): Promise<Item[]> {
  let query = db('items')
    .leftJoin('categories', 'items.category_id', 'categories.id')
    .where('items.user_id', userId)
    .select('items.*', 'categories.name as category_name')
    .orderBy('items.due_date', filters.sort || 'asc');

  if (filters.status) query = query.where('items.status', filters.status);
  if (filters.category_id) query = query.where('items.category_id', filters.category_id);
  if (filters.due_from) query = query.where('items.due_date', '>=', filters.due_from);
  if (filters.due_to) query = query.where('items.due_date', '<=', filters.due_to);

  if (filters.tag_id) {
    query = query.join('item_tags', 'items.id', 'item_tags.item_id').where('item_tags.tag_id', filters.tag_id);
  }

  const items = await query;
  return attachTags(items);
}

export async function findByIdAndUser(id: string, userId: string): Promise<Item | undefined> {
  const item = await db('items')
    .leftJoin('categories', 'items.category_id', 'categories.id')
    .where({ 'items.id': id, 'items.user_id': userId })
    .select('items.*', 'categories.name as category_name')
    .first();
  if (!item) return undefined;
  const [withTags] = await attachTags([item]);
  return withTags;
}

export async function createItem(
  userId: string,
  data: {
    title: string;
    notes?: string;
    due_date: string;
    category_id?: string;
    recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurrence_interval?: number;
    generated_from_item_id?: string;
    tag_ids?: string[];
  }
): Promise<Item> {
  const { tag_ids, ...rest } = data;
  const [item] = await db('items')
    .insert({ ...rest, user_id: userId, status: 'pending' })
    .returning('*');

  if (tag_ids && tag_ids.length > 0) {
    await db('item_tags').insert(tag_ids.map((tag_id) => ({ item_id: item.id, tag_id })));
  }

  const [withTags] = await attachTags([item]);
  return withTags;
}

export async function updateItem(
  id: string,
  userId: string,
  data: Partial<{
    title: string;
    notes: string;
    due_date: string;
    category_id: string | null;
    recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurrence_interval: number;
    status: 'pending' | 'completed' | 'overdue' | 'archived';
    archived_at: Date | null;
    tag_ids: string[];
  }>
): Promise<Item | undefined> {
  const { tag_ids, ...rest } = data;
  const [item] = await db('items').where({ id, user_id: userId }).update(rest).returning('*');
  if (!item) return undefined;

  if (tag_ids !== undefined) {
    await db('item_tags').where({ item_id: id }).delete();
    if (tag_ids.length > 0) {
      await db('item_tags').insert(tag_ids.map((tag_id) => ({ item_id: id, tag_id })));
    }
  }

  const [withTags] = await attachTags([item]);
  return withTags;
}

export async function deleteItem(id: string, userId: string): Promise<boolean> {
  const count = await db('items').where({ id, user_id: userId }).delete();
  return count > 0;
}

export async function findDuplicateRecurrence(generatedFromItemId: string): Promise<Item | undefined> {
  return db('items').where({ generated_from_item_id: generatedFromItemId }).first();
}

export async function findItemsDueWithinDays(userId: string, days: number): Promise<Item[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const future = new Date(today);
  future.setDate(future.getDate() + days);

  return db('items')
    .where('user_id', userId)
    .whereIn('status', ['pending'])
    .where('due_date', '>=', today.toISOString().split('T')[0])
    .where('due_date', '<=', future.toISOString().split('T')[0])
    .orderBy('due_date', 'asc');
}

export async function findOverdueItems(userId: string): Promise<Item[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return db('items')
    .where('user_id', userId)
    .whereIn('status', ['pending', 'overdue'])
    .where('due_date', '<', today.toISOString().split('T')[0])
    .orderBy('due_date', 'asc');
}

export async function getDashboardSummary(userId: string): Promise<{
  overdue: Item[];
  dueSoon: Item[];
  upcoming: Item[];
}> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const day7 = new Date(today);
  day7.setDate(day7.getDate() + 7);
  const day7Str = day7.toISOString().split('T')[0];

  const day30 = new Date(today);
  day30.setDate(day30.getDate() + 30);
  const day30Str = day30.toISOString().split('T')[0];

  const [overdue, dueSoon, upcoming] = await Promise.all([
    db('items').where('user_id', userId).whereIn('status', ['pending', 'overdue']).where('due_date', '<', todayStr).orderBy('due_date', 'asc'),
    db('items').where('user_id', userId).whereIn('status', ['pending']).where('due_date', '>=', todayStr).where('due_date', '<=', day7Str).orderBy('due_date', 'asc'),
    db('items').where('user_id', userId).whereIn('status', ['pending']).where('due_date', '>', day7Str).where('due_date', '<=', day30Str).orderBy('due_date', 'asc'),
  ]);

  return {
    overdue: await attachTags(overdue),
    dueSoon: await attachTags(dueSoon),
    upcoming: await attachTags(upcoming),
  };
}
