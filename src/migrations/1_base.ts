import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('routes')
    .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
    .addColumn('route_name', 'text')
    .addColumn('route_stops', 'json')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  db.schema.dropTable('routes').execute()
}
