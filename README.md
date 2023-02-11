## BMTC data scraper

A small project group to create a search engine for BMTC buses in Bangalore.

## Attribution
- The data is scraped from the [Travel 2 Karnataka website](https://travel2karnataka.com)
- The scraped data is not monetized in any form, and is used for public usage only
- This project and other related projects are licensed unser the [MIT license](https://opensource.org/licenses/MIT)
- The source code is open source and is available on github
- The disclaimer of the owners of the data is available on the [Travel 2 Karnataka website](https://travel2karnataka.com/disclaimer.htm)

We are grateful to the owners of the data.

## Usage
- install node using fnm/nvm
- install pnpm `npm i -g pnpm`
- run `pnpm install`
- to use the scraper run `pnpm run start --scrape`
- to build data run `pnpm run build`
- The builder is a pipeline so you can add more pipes or plugins to the pipeline easily. The builder is in `src/builder.ts`
- The scraper is in `src/index.ts`

## Projects using the scraper
- [Bus find](https://github.com/soulsam480/bus-find) [MIT License]

## How it works
- I found out that BMTC has routes till `606` number
- so the scraper scrapes the data from route `1` to `606`
- for each route it visits the source page with cheerio then
  - get the google map link
  - stops
- all the data is written to a SQLite DB via kysely
- we're writing to a db as it's easy to query and transform the data