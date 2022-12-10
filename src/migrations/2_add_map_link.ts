import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('routes').addColumn('map_link', 'text').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  db.schema.alterTable('routes').dropColumn('map_link').execute();
}
