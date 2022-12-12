import { Kysely } from 'kysely';
import { IDatabase } from 'src/db';

export async function up(db: Kysely<IDatabase>): Promise<void> {
  await db.schema
    .createIndex('routes_index')
    .on('routes')
    .columns(['route_name', 'route_stops'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  db.schema.dropIndex('routes_index').execute();
}
