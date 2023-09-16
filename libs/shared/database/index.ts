import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Tables } from './tables.interface';
import { Config } from '@face-recognition-demo/shared/config';

Config.database.validate();

export function getDB(): Kysely<Tables> {
  return new Kysely<Tables>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: Config.database.connectionString,
        database: Config.database.dbName,
      }),
    }),
  });
}

export const db = getDB();
export * from './tables.interface';
