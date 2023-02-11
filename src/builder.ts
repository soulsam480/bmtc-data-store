import * as R from 'remeda'
import { outputFile } from 'fs-extra'
import { dbExec } from './db'

type ResolvePromise<T> = T extends Promise<infer U> ? U : T

type BaseResult = ResolvePromise<ReturnType<typeof buildBase>>

type BuildPlugin = (data: BaseResult) => Promise<BaseResult>

async function buildBase() {
  const data = await dbExec(async (db) => {
    return await db.selectFrom('routes').selectAll().execute()
  })

  const stringified = JSON.stringify(data)

  await outputFile('build/db.json', stringified)

  return data
}

const buildRouteAndStops: BuildPlugin = async (data) => {
  const routes = R.pipe(
    data,
    R.map(i => i.route_stops),
    R.flatten(),
    R.uniq(),
  )

  await outputFile('build/stops.json', JSON.stringify(routes))

  const stopRoutes = routes.reduce((acc, stop) => {
    return {
      ...acc,
      [stop]: R.pipe(
        data,
        R.filter(i => i.route_stops.includes(stop)),
        R.map(i => i.route_name),
      ),
    }
  }, {})

  await outputFile('build/stop-routes.json', JSON.stringify(stopRoutes))

  return data
}

async function main() {
  // create build plugins and add them to the pipeline
  // all plugins should be of `BuildPlugin` type
  await R.pipe(await buildBase(), buildRouteAndStops)
}

void main()
