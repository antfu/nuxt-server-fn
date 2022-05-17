import { join } from 'path'
import { addServerHandler, defineNuxtModule } from '@nuxt/kit'
import fs from 'fs-extra'

export interface ModuleOptions {
  /**
   * @default '/api/__server_fn__'
   */
  apiRoute?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-server-fn',
    configKey: 'serverFn',
  },
  defaults: {
    apiRoute: '/api/__server_fn__',
  },
  async setup(options, nuxt) {
    const {
      apiRoute,
    } = options

    const clientPath = join(nuxt.options.buildDir, 'server-fn-client.ts')
    const handlerPath = join(nuxt.options.buildDir, 'server-fn-handler.ts')

    nuxt.hook('config', (options) => {
      options.build.transpile.push('nuxt-server-fn/client')
    })

    addServerHandler({
      route: apiRoute,
      handler: handlerPath,
    })

    nuxt.hook('autoImports:extend', (imports) => {
      imports.push(
        {
          from: clientPath,
          name: 'useServerFn',
        },
        {
          from: clientPath,
          name: 'useServerStateFn',
        },
      )
    })

    await fs.writeFile(clientPath, `
import { createServerFn, createServerStateFn } from 'nuxt-server-fn/client'
import type * as functions from '~/server/fn'

/**
 * Use server functions in client
 * A POST request to Nuxt server will be created for each function call and will not cache.
 * For a cached version, use \`useServerStateFn()\`
 */
export const useServerFn = createServerFn<typeof functions>("${apiRoute}")

/**
 * Auto cached version of \`useServerFn()\`, using \`useState()\` under the hood.
 * The result will be shared across client and server for hydration.
 */
export const useServerStateFn = createServerStateFn<typeof functions>("${apiRoute}")
`.trimStart())

    await fs.writeFile(handlerPath, `
import { createServerFnAPI } from 'nuxt-server-fn/api'
import * as functions from '~/server/fn'

export default createServerFnAPI(functions)
`.trimStart())
  },
})
