import db from '../knex';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export async function findByEmail(email: string): Promise<User | undefined> {
  return db('users').where({ email }).first();
}

export async function findById(id: string): Promise<User | undefined> {
  return db('users').where({ id }).first();
}

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const [user] = await db('users').insert({ email, password_hash: passwordHash }).returning('*');
  return user;
}
