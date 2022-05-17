import { hash as ohash } from 'ohash'
// @ts-expect-error nuxt
import { useState } from '#app'

declare const $fetch: typeof import('ohmyfetch').$fetch

export type ArgumentsType<T> = T extends (...args: infer A) => any ? A : never
export type ReturnType<T> = T extends (...args: any) => infer R ? R : never

export type Promisify<T> = ReturnType<T> extends Promise<any>
  ? T
  : (...args: ArgumentsType<T>) => Promise<Awaited<ReturnType<T>>>

export type ClientRPC<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? Promisify<T[K]> : never
}

export function createServerFn<T>(route: string) {
  return () => {
    return new Proxy({}, {
      get(_, name) {
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
    }) as ClientRPC<T>
  }
}

export function createServerStateFn<T>(route: string) {
  return () => {
    const _cache = useState('server-fn-cache', () => new Map<string, any>())
    const _promise = useState('server-fn-promise', () => new Map<string, Promise<T>>())

    return new Proxy({}, {
      get(_, name) {
        return async (...args: any[]) => {
          const hash = ohash({ name, args })
          if (_cache.value.has(hash))
            return _cache.value.get(hash)

          if (_promise.value.has(hash))
            return _promise.value.get(hash)

          const request = $fetch(route, {
            method: 'POST',
            body: {
              name,
              args,
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
    }) as ClientRPC<T>
  }
}
