import type { EventHandler } from 'h3'
import { useBody } from 'h3'
import { getQuery } from 'ufo'

export function createServerFnAPI<T>(functions: T): EventHandler<T> {
  return async (event) => {
    let name: string | undefined
    let args: any[] = []

    if (event.req.method === 'POST') {
      const body = await useBody(event)
      name = body.name
      args = body.args || []
    }
    else {
      const query = getQuery(event.req.url!) as Record<string, string>
      name = query.name
      args = JSON.parse(query.args || '[]') || []
    }

    if (!name || !(name in functions)) {
      event.res.statusCode = 404
      return
    }
    const result = await functions[name](...args)
    return result
  }
}
