import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      database: 'logistics_tracker',
      user: 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    },
    migrations: {
      directory: './src/db/migrations',
      extension: 'ts',
    },
    pool: { min: 2, max: 10 },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: './dist/db/migrations',
      loadExtensions: ['.js'],
      disableMigrationsListValidation: true,
    },
    pool: { min: 2, max: 10 },
  },
};

export default config;
