# nuxt-server-fn

[![NPM version](https://img.shields.io/npm/v/nuxt-server-fn?color=a1b858&label=)](https://www.npmjs.com/package/nuxt-server-fn)

Server functions in client for Nuxt 3. [Experiments of this RFC](https://github.com/unjs/nitro/discussions/235).

> ⚠️ Experimental ⚠️ APIs are subject to change.

## Install

```bash
npm i -D nuxt-server-fn
```

```ts
// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  modules: [
    'nuxt-server-fn',
  ],
})
```

## Usage

Expose server functions under `server/functions/*.ts`

```ts
// server/functions/foo.ts

export function myFunction(name: string) {
  return `Hello ${name} from server`
}
```

On the client side:

```ts
const { myFunction } = useServerStateFn()
const msg = await myFunction('Nuxt') // 'Hello Nuxt from server'
```

Checkout [the playground example](https://github.com/antfu/nuxt-server-fn/blob/main/playground).

## Client Functions

Client functions can be auto imported.

### `useServerFunctions()`

Use server functions in client. A POST request to Nuxt server will be created for function calls.

By default it's **aggressively cached** using the [`useState()` hook](https://v3.nuxtjs.org/api/composables/use-state) under the hood. Multiple calls to the same arguments will reuse the same result across client and server sides for hydration.

```ts
const serverFn = useServerFunctions()
const msg1 = await serverFn.myFunction('Nuxt')
const msg2 = await serverFn.myFunction('Nuxt') // functions with same arguments will be cached, only one request
```

To opt-out the caches, pass `cache: false`:

```ts
const serverFn = useServerFunctions({ cache: false })
const msg1 = await serverFn.myFunction('Nuxt')
const msg2 = await serverFn.myFunction('Nuxt') // two requests will be fired
```

## Server

Named exported inside `server/functions/*.ts` will be available to client automatically.

### Request Context

Request context is available as `this` for functions. When using TypeScript, the type of `this` needs to be specified explicitly as `H3Event` from `h3`.

For example:

```ts
import type { H3Event } from 'h3'

export function myFunction(this: H3Event, firstArg: any) {
  const { req, res } = this
  const body = useBody(this)
  // ...
}
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2022 [Anthony Fu](https://github.com/antfu)
