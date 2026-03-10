import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('category_id').nullable().references('id').inTable('categories').onDelete('SET NULL');
    table.uuid('generated_from_item_id').nullable().references('id').inTable('items').onDelete('SET NULL');
    table.string('title', 255).notNullable();
    table.text('notes').nullable();
    table.date('due_date').notNullable();
    table.enum('status', ['pending', 'completed', 'overdue', 'archived']).notNullable().defaultTo('pending');
    table.enum('recurrence_type', ['none', 'weekly', 'monthly', 'yearly']).notNullable().defaultTo('none');
    table.integer('recurrence_interval').notNullable().defaultTo(1);
    table.timestamp('archived_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'due_date']);
    table.index(['user_id', 'status', 'due_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('items');
}
