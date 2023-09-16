import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE EXTENSION vector`.execute(db);
}

export function down(): Promise<void> {
  return;
}
