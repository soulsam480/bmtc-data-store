import { writeFile } from 'fs/promises';
import { dbExec } from './db';

async function writeToJson() {
  const data = await dbExec(async (db) => {
    return await db.selectFrom('routes').selectAll().execute();
  });

  const stringified = JSON.stringify(data);

  await writeFile('build/db.json', stringified);
}

void writeToJson();
