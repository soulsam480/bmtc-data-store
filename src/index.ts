import { load } from 'cheerio';
import { dbExec, migrator } from './db';

const BASE = 'https://travel2karnataka.com/bustrack.php';

interface IRouteInfo {
  route_name: string;
  route_stops: string[];
}

async function scraper(id: number) {
  try {
    const data = await fetch(`${BASE}?id=${id}`);

    const $ = load(await data.text());

    if ($('[class="bus routes"]').text().length === 0)
      throw new Error(`No route found for id: ${id}`);

    const table = $('[class="bus routes"] > tbody > tr:not(:first-child)')
      .map((_, el) => {
        return {
          route_name: $(el).find('td:nth-child(1)').text(),
          route_stops: $(el).find('td:nth-child(2)').text().split(','),
        } as IRouteInfo;
      })
      .toArray();

    if (table.length === 0) {
      console.log('No route found for id:', id, 'skipping');
      return;
    }

    for (const row of table) {
      console.log('Inserting route:', row.route_name, 'for id:', id);

      try {
        const resp = await dbExec(async (db) => {
          return await db
            .insertInto('routes')
            .values({
              route_name: row.route_name,
              route_stops: JSON.stringify(row.route_stops) as any,
            })
            .returningAll()
            .execute();
        });

        console.log('route', resp);
      } catch (error) {
        console.log('ERROR while inseting id:', id, error);
        continue;
      }
    }

    console.log(`Done ${id}`);
  } catch (error) {
    console.log('Error while scraping id:', id, error);
  }
}

async function main() {
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('failed to migrate');
    console.error(error);
    process.exit(1);
  }

  for (let i = 1; i <= 606; i++) {
    await scraper(i);
  }
}

void main();
