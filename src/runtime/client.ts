import { hash as ohash } from 'ohash'
// @ts-expect-error nuxt
import { useNuxtApp } from '#app'

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
    const nuxt = useNuxtApp()
    nuxt.payload.functions = nuxt.payload.functions || {}
    const _promise: Map<string, Promise<T>> = nuxt.__server_function_promise = nuxt.__server_function_promise || new Map()

    return new Proxy({}, {
      get(_, name) {
        return async (...args: any[]) => {
          const body = { name, args }
          const hash = ohash(body)
          if (hash in nuxt.payload.functions)
            return nuxt.payload.functions[hash]

          if (_promise.has(hash))
            return _promise.get(hash)

          const request = $fetch(route, { method: 'POST', body })
            .then((r) => {
              nuxt.payload.functions[hash] = r
              _promise.delete(hash)
              return r
            })

          _promise.set(hash, request)

          return request
        }
      },
    }) as ClientRPC<T>
  }
}
