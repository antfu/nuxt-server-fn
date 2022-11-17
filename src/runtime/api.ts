import type { EventHandler } from 'h3'
import { readBody } from 'h3'
import { getQuery } from 'ufo'

export function createServerFnAPI<T>(functions: T): EventHandler<T> {
  return async (event) => {
    let name: string | undefined
    let args: any[] = []

    if (event.node.req.method === 'POST') {
      const body = await readBody(event)
      name = body.name
      args = body.args || []
    }
    else {
      const query = getQuery(event.node.req.url!) as Record<string, string>
      name = query.name
      args = JSON.parse(query.args || '[]') || []
    }

    if (!name || !(name in functions)) {
      event.node.res.statusCode = 404
      return
    }

    const result = await functions[name].apply(event, args)
    return result
  }
}
