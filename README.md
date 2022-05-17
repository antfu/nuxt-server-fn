# nuxt-server-fn

[![NPM version](https://img.shields.io/npm/v/nuxt-server-fn?color=a1b858&label=)](https://www.npmjs.com/package/nuxt-server-fn)

Server functions RPC in client for Nuxt 3.

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

Expose server functions under `server/fn/index.ts`

```ts
// server/fn/index.ts

export function myFunction(name: string) {
  return `Hello ${name} from server`
}
```

On the client side:

```ts
const serverFn = useServerStateFn()
const msg = await serverFn.myFunction('Nuxt') // 'Hello Nuxt from server'
```

## Client Functions

Client functions can be auto imported.

### `useServerFn()`

Use server functions in client. A POST request to Nuxt server will be created for each function call and will not cache.

```ts
const serverFn = useServerFn()
const msg1 = await serverFn.myFunction('Nuxt')
const msg2 = await serverFn.myFunction('Nuxt') // two requests will be fired
```

For a cached version, use `useServerStateFn()` instead.

### `useServerStateFn()`

**Aggressively cached** version of `useServerFn()` using the [`useState()` hook](https://v3.nuxtjs.org/api/composables/use-state) under the hood. Multiple calls to the same arguments will reuse the same result across client and server sides for hydration.

```ts
const serverFn = useServerStateFn()
const msg1 = await serverFn.myFunction('Nuxt')
const msg2 = await serverFn.myFunction('Nuxt') // functions with same arguments will be cached, only one request
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2022 [Anthony Fu](https://github.com/antfu)
