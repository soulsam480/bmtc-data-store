import fs from 'node:fs/promises'
import path from 'node:path'
import type { Generated } from 'kysely'
import {
  FileMigrationProvider,
  Kysely,
  Migrator,
  SqliteDialect,
} from 'kysely'
import Database from 'better-sqlite3'
import { JSONPlugin } from './JSONPlugin'

interface IRouteTable {
  id: Generated<number>
  route_name: string
  route_stops: string[]
  map_link: string | null
}

export interface IDatabase {
  routes: IRouteTable
}

const sqliteDriver = new Database('bmtc.db')

sqliteDriver.prepare('vacuum;').run()

const db = new Kysely<IDatabase>({
  dialect: new SqliteDialect({
    database: sqliteDriver,
  }),
  log: ['query', 'error'],
  plugins: [new JSONPlugin({ jsonFields: ['route_stops'] })],
})

export const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, '../src/migrations'),
  }),
})

export type IDb = typeof db

export async function dbExec<T>(fn: (db: IDb) => Promise<T>) {
  return await fn(db)
}
