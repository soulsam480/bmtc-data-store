import { dbExec } from './db';
import * as R from 'remeda';
import { outputFile } from 'fs-extra';

async function builddDB() {
  const data = await dbExec(async (db) => {
    return await db.selectFrom('routes').selectAll().execute();
  });

  const stringified = JSON.stringify(data);

  await outputFile('build/db.json', stringified);

  return data;
}

async function main() {
  await R.pipe(await builddDB(), async (data) => {
    const routes = R.pipe(
      data,
      R.map((i) => i.route_stops),
      R.flatten(),
      R.uniq(),
    );

    await outputFile('build/stops.json', JSON.stringify(routes));

    const stopRoutes = routes.reduce((acc, stop) => {
      return {
        ...acc,
        [stop]: R.pipe(
          data,
          R.filter((i) => i.route_stops.includes(stop)),
          R.map((i) => i.route_name),
        ),
      };
    }, {});

    await outputFile('build/stop-routes.json', JSON.stringify(stopRoutes));
  });
}

void main();
