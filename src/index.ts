import { load } from 'cheerio';
import { writeFile as nodeWriteFile, access, mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://travel2karnataka.com/bustrack.php';

interface IRouteInfo {
  no: string;
  stops: string[];
}

async function isExists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function writeFile(filePath: string, data: string) {
  try {
    const dirname = path.dirname(filePath);
    const exist = await isExists(dirname);
    if (!exist) {
      await mkdir(dirname, { recursive: true });
    }

    await nodeWriteFile(filePath, data);
  } catch (err) {
    throw new Error(err);
  }
}

async function scraper(id: number) {
  try {
    const data = await fetch(`${BASE}?id=${id}`);

    const $ = load(await data.text());

    const table = $('[class="bus routes"] > tbody > tr:not(:first-child)')
      .map((_, el) => {
        return {
          no: $(el).find('td:nth-child(1)').text(),
          stops: $(el).find('td:nth-child(2)').text().split(','),
        } as IRouteInfo;
      })
      .toArray();

    await writeFile(`data/route-no-${id}.json`, JSON.stringify(table, null, 2));

    console.log(`Done ${id}`);
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  for (let i = 1; i <= 99; i++) {
    await scraper(i);
  }
}

void main();
