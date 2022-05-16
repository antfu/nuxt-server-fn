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
const serverFn = useServerFn()
const msg = await serverFn.myFunction('Nuxt') // 'Hello Nuxt from server'
```

By default the server functions are aggressively cached. Multiple calls to the same arguments will return the same result. To opt-out, pass `false` to `useServerFn`

```ts
const serverFn = useServerFn(false) // no cache
const msg = await serverFn.myFunction('Nuxt')
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2022 [Anthony Fu](https://github.com/antfu)
