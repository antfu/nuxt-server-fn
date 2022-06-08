import { hash as ohash } from 'ohash'
// @ts-expect-error nuxt
import { useNuxtApp } from '#app'

declare const $fetch: typeof import('ohmyfetch').$fetch

export type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never
export type ReturnType<T> = T extends (...args: any) => infer R ? R : never

export type Promisify<T> = ReturnType<T> extends Promise<any>
  ? T
  : (...args: ArgumentsType<T>) => Promise<Awaited<ReturnType<T>>>

export type FunctionsClient<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? Promisify<T[K]> : never
}

export type CachedFunctionsClient<T> = FunctionsClient<T> & {
  /**
   * Get uncached version of the functions
   */
  $cacheless: CachelessFunctionsClient<T>
}
export type CachelessFunctionsClient<T> = FunctionsClient<T> & {
  /**
   * Get cached version of the functions
   */
  $cached: CachedFunctionsClient<T>
}

export interface ServerFunctionsOptions<Cache extends boolean = true> {
  /**
   * Cache result with same arguments for hydration
   *
   * @default true
   */
  cache?: Cache
}

interface InternalState<T> {
  promiseMap: Map<string, Promise<T>>
  cachedClient: CachedFunctionsClient<T>
  cachelessClient: CachelessFunctionsClient<T>
}

export function createServerFunctions<T>(route: string) {
  return <C extends boolean = true>(
    options: ServerFunctionsOptions<C> = {},
  ): C extends false ? CachelessFunctionsClient<T>: CachedFunctionsClient<T> => {
    const { cache = true } = options
    const nuxt = useNuxtApp()
    nuxt.payload.functions = nuxt.payload.functions || {}

    const state = nuxt.__server_fn__ || {} as InternalState<T>
    const promiseMap = state.promiseMap = state.promiseMap || new Map()

    let cachedClient: CachedFunctionsClient<T>
    let cachelessClient: CachelessFunctionsClient<T>

    // eslint-disable-next-line prefer-const
    cachelessClient = state.noCacheClient = state.noCacheClient || new Proxy({}, {
      get(_, name) {
        if (name === '$cached')
          return cachedClient

        return async (...args: any[]) => {
          return $fetch(route, {
            method: 'POST',
            body: {
              name,
              args,
            },
          })
        }
      },
    }) as CachelessFunctionsClient<T>

    cachedClient = state.cacheClient = state.cacheClient || new Proxy({}, {
      get(_, name: string) {
        if (name === '$cacheless')
          return cachelessClient

        return async (...args: any[]) => {
          const body = { name, args }
          const key = args.length === 0 ? name : `${name}-${ohash(args)}`
          if (key in nuxt.payload.functions)
            return nuxt.payload.functions[key]

          if (promiseMap.has(key))
            return promiseMap.get(key)

          const request = $fetch(route, { method: 'POST', body })
            .then((r) => {
              nuxt.payload.functions[key] = r
              promiseMap.delete(key)
              return r
            })

          promiseMap.set(key, request)

          return request
        }
      },
    }) as CachedFunctionsClient<T>

    return (cache ? cachedClient : cachelessClient) as any
  }
}
