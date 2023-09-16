import { Kysely, sql } from 'kysely';
import { createPrimaryKeyIndex } from '../tableDefault';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS faces
    (
        id integer SERIAL',
        name text NOT NULL,
        vector vector(128) NOT NULL,
        created_at timestamp without time zone DEFAULT NOW(),
        updated_at timestamp without time zone DEFAULT NOW(),
        deleted_at timestamp without time zone
    )
  `.execute(db);

  await createPrimaryKeyIndex(db, 'faces');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('faces').execute();
}
