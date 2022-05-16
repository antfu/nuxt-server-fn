import { dirname, join, resolve } from 'path'
import { defineNuxtModule } from '@nuxt/kit'
import fs from 'fs-extra'
import { ROUTE } from './runtime/constant'

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
    const root = nuxt.options.rootDir
    const apiPath = resolve(root, `server/api/${ROUTE}.ts`)
    await fs.ensureDir(dirname(apiPath))
    await fs.writeFile(apiPath, `
// generate by nuxt-server-fn
import { createServerFnAPI } from 'nuxt-server-fn/api'
import * as functions from '../fn'

export default createServerFnAPI(functions)
`.trimStart())

    const clientPath = join(nuxt.options.buildDir, 'server-fn-client.ts')
    await fs.writeFile(clientPath, `
import { createServerFnClient } from 'nuxt-server-fn/client'
import type * as functions from '~/server/fn'

export const useServerFn = createServerFnClient<typeof functions>()
`.trimStart())

    nuxt.hook('autoImports:extend', (imports) => {
      imports.push({
        from: clientPath,
        name: 'useServerFn',
        as: 'useServerFn',
      })
    })
  },
})
