import {
  FileMigrationProvider,
  Generated,
  Kysely,
  Migrator,
  SqliteDialect,
} from 'kysely';
import IDatabase from 'better-sqlite3';
import fs from 'node:fs/promises';
import path from 'node:path';

interface IRouteTable {
  id: Generated<number>;
  route_name: string;
  route_stops: string[];
}

interface IDatabase {
  routes: IRouteTable;
}

// You'd create one of these when you start your app.
const db = new Kysely<IDatabase>({
  // Use MysqlDialect for MySQL and SqliteDialect for SQLite.
  dialect: new SqliteDialect({
    database: new IDatabase('bmtc.db'),
  }),
  log: ['query', 'error'],
});

export const migrator = new Migrator({
  db: db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, '../src/migrations'),
  }),
});

type IDb = typeof db;

export async function dbExec<T>(fn: (db: IDb) => Promise<T>) {
  return await fn(db);
}
