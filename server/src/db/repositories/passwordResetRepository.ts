import db from '../knex';

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export async function create(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
  await db('password_reset_tokens').insert({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt });
}

export async function findValidByHash(tokenHash: string): Promise<PasswordResetToken | undefined> {
  return db('password_reset_tokens')
    .where({ token_hash: tokenHash })
    .whereNull('used_at')
    .where('expires_at', '>', new Date())
    .first();
}

export async function markUsed(id: string): Promise<void> {
  await db('password_reset_tokens').where({ id }).update({ used_at: new Date() });
}

export async function invalidateAllForUser(userId: string): Promise<void> {
  await db('password_reset_tokens').where({ user_id: userId }).whereNull('used_at').update({ used_at: new Date() });
}

export async function updateUserPasswordHash(userId: string, newHash: string): Promise<void> {
  await db('users').where({ id: userId }).update({ password_hash: newHash });
}
