import { load } from 'cheerio';
import { dbExec, migrator } from './db';

const ROUTE_DETAILS_BASE = 'https://travel2karnataka.com/bustrack.php';

interface IRouteInfo {
  route_name: string;
  route_stops: string[];
}

async function getRouteMapUrl(id: number) {
  const pageResponse = await fetch(
    `https://travel2karnataka.com/${id}_bmtc_route_map.htm`,
  );

  const $ = load(await pageResponse.text());

  const mapEl = $('a:icontains(View Larger Map)');

  if (mapEl.text().length === 0) return null;

  return mapEl.attr('href') ?? null;
}

async function getRouteDetails(id: number) {
  try {
    const pageResponse = await fetch(`${ROUTE_DETAILS_BASE}?id=${id}`);

    const $ = load(await pageResponse.text());

    const tableEl = $('[class="bus routes"] > tbody > tr:not(:first-child)');

    if (tableEl.text().length === 0) {
      throw new Error(`No route found for id: ${id}`);
    }

    const rows = tableEl
      .map((_, el) => {
        return {
          route_name: $(el).find('td:nth-child(1)').text(),
          route_stops: $(el)
            .find('td:nth-child(2)')
            .text()
            .split(',')
            .map((i) => i.trim())
            .filter(Boolean),
        } as IRouteInfo;
      })
      .toArray();

    const mapLink = await getRouteMapUrl(id);

    console.log('map link', mapLink);

    for (const row of rows) {
      try {
        await dbExec(async (db) => {
          return await db
            .insertInto('routes')
            .values({
              route_name: row.route_name.trim(),
              route_stops: JSON.stringify(row.route_stops) as any,
              map_link: mapLink,
            })
            .execute();
        });

        console.log('Done adding route:', row.route_name);
      } catch (error) {
        console.log('ERROR while inserting route:', row.route_name, error);
        continue;
      }
    }

    console.log(`Done fetching routes for:${id}`);
  } catch (error) {
    console.log('Error while fetching routes for:', id, error);
  }
}

async function getAllRoutes() {
  await dbExec(async (db) => {
    return await db
      .deleteFrom('routes')
      .where('id', 'is not', null as any)
      .execute();
  });

  for (let i = 1; i <= 606; i++) {
    await getRouteDetails(i);
  }
}

async function main(scrape = false) {
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

  if (scrape) {
    await getAllRoutes();
  }
}

void main(true);
