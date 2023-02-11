import type {
  KyselyPlugin,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
  QueryResult,
  RootOperationNode,
  UnknownRow,
} from 'kysely'

interface IJSONPluginArgs {
  jsonFields: string[]
}

export class JSONPlugin implements KyselyPlugin {
  #jsonFields: string[] = []

  constructor(args: IJSONPluginArgs) {
    this.#jsonFields = args.jsonFields
  }

  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    return args.node
  }

  async transformResult(
    args: PluginTransformResultArgs,
  ): Promise<QueryResult<UnknownRow>> {
    if (args.result.rows && Array.isArray(args.result.rows)) {
      return {
        ...args.result,
        rows: args.result.rows.map(row => this.#mapRow(row)),
      }
    }

    return args.result
  }

  #mapRow(row: UnknownRow) {
    return Object.keys(row).reduce<UnknownRow>((acc, key) => {
      if (this.#jsonFields.includes(key)) {
        return {
          ...acc,
          [key]: JSON.parse(row[key] as string),
        }
      }

      return {
        ...acc,
        [key]: row[key],
      }
    }, {})
  }
}
