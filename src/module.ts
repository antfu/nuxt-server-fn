import { join } from 'path'
import { addServerHandler, defineNuxtModule } from '@nuxt/kit'
import fs from 'fs-extra'

export interface ModuleOptions {
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-server-fn',
    configKey: 'serverFn',
  },
  defaults: {
  },
  async setup(options, nuxt) {
    const clientPath = join(nuxt.options.buildDir, 'server-fn-client.ts')
    const handlerPath = join(nuxt.options.buildDir, 'server-fn-handler.ts')

    nuxt.hook('config', (options) => {
      options.build.transpile.push('nuxt-server-fn/client')
    })

    addServerHandler({
      route: '/api/__server_fn__',
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

export const useServerFn = createServerFn<typeof functions>()
export const useServerStateFn = createServerStateFn<typeof functions>()
`.trimStart())

    await fs.writeFile(handlerPath, `
import { createServerFnAPI } from 'nuxt-server-fn/api'
import * as functions from '~/server/fn'

export default createServerFnAPI(functions)
`.trimStart())
  },
})
