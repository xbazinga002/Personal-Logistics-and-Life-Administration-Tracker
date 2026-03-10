import db from '../knex';

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: Date;
}

export async function findAllByUser(userId: string): Promise<Tag[]> {
  return db('tags').where({ user_id: userId }).orderBy('name', 'asc');
}

export async function create(userId: string, name: string): Promise<Tag> {
  const [tag] = await db('tags').insert({ user_id: userId, name }).returning('*');
  return tag;
}

export async function deleteTag(id: string, userId: string): Promise<boolean> {
  const count = await db('tags').where({ id, user_id: userId }).delete();
  return count > 0;
}
