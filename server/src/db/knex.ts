import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL || {
    host: 'localhost',
    port: 5432,
    database: 'logistics_tracker',
    user: 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  pool: { min: 2, max: 10 },
});

export default db;
