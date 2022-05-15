import { dirname, resolve } from 'path'
import { defineNuxtModule } from '@nuxt/kit'
import fs from 'fs-extra'

const ROUTE = '__server_fn'
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
    await fs.writeFile(apiPath, 'export default () => ({hi:"1"})')
  },
})
