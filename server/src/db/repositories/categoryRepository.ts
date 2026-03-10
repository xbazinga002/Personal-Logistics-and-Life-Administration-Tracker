import db from '../knex';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  created_at: Date;
}

export async function findAllByUser(userId: string): Promise<Category[]> {
  return db('categories').where({ user_id: userId }).orderBy('name', 'asc');
}

export async function create(userId: string, name: string): Promise<Category> {
  const [category] = await db('categories').insert({ user_id: userId, name }).returning('*');
  return category;
}

export async function deleteCategory(id: string, userId: string): Promise<boolean> {
  const count = await db('categories').where({ id, user_id: userId }).delete();
  return count > 0;
}
