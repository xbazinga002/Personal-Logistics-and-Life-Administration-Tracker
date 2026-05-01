import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE items DROP CONSTRAINT IF EXISTS items_recurrence_type_check`);
  await knex.raw(
    `ALTER TABLE items ADD CONSTRAINT items_recurrence_type_check ` +
    `CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly'))`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE items DROP CONSTRAINT IF EXISTS items_recurrence_type_check`);
  await knex.raw(
    `ALTER TABLE items ADD CONSTRAINT items_recurrence_type_check ` +
    `CHECK (recurrence_type IN ('none', 'weekly', 'monthly', 'yearly'))`
  );
}
