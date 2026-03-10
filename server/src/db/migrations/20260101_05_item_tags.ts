import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('item_tags', (table) => {
    table.uuid('item_id').notNullable().references('id').inTable('items').onDelete('CASCADE');
    table.uuid('tag_id').notNullable().references('id').inTable('tags').onDelete('CASCADE');
    table.primary(['item_id', 'tag_id']);
    table.index(['item_id']);
    table.index(['tag_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('item_tags');
}
