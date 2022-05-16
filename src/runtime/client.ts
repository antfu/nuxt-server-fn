import { hash as ohash } from 'ohash'
import { ROUTE } from './constant'
// @ts-expect-error nuxt
import { useState } from '#app'

declare const $fetch: typeof import('ohmyfetch').$fetch

export function createServerFnClient<T>() {
  function withCache() {
    const _cache = useState('server-fn-cache', () => new Map<string, any>())
    const _promise = useState('server-fn-promise', () => new Map<string, Promise<T>>())

    return new Proxy({}, {
      get(_, name) {
        return (...args: any[]) => {
          const hash = ohash([name, args])
          if (_cache.value.has(hash))
            return _cache.value.get(hash)

          if (_promise.value.has(hash))
            return _promise.value.get(hash)

          const request = $fetch(`/api/${ROUTE}`, {
            method: 'GET',
            params: {
              name,
              args: JSON.stringify(args),
            },
          })
            .then((r) => {
              _cache.value.set(hash, r)
              _promise.value.delete(hash)
              return r
            })

          _promise.value.set(hash, request)

          return request
        }
      },
    }) as T
  }

  function noCache() {
    return new Proxy({}, {
      get(_, name) {
        return (...args: any[]) => {
          return $fetch(`/api/${ROUTE}`, {
            method: 'POST',
            body: {
              name,
              args,
            },
          })
        }
      },
    }) as T
  }

  /**
   * Execute server functions via RPC
   *
   * @param cache - cache requests with same arguments (default true)
   */
  function useServerFn(cache = true): T {
    return cache ? withCache() : noCache()
  }

  return useServerFn
}
