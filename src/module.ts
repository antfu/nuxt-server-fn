import { join } from 'path'
import { addServerHandler, defineNuxtModule } from '@nuxt/kit'
import fs from 'fs-extra'
import fg from 'fast-glob'

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

    const dirs = [
      join(nuxt.options.rootDir, 'server/functions'),
    ]
    const functionsPath = join(nuxt.options.buildDir, 'server-fn.ts')
    const clientPath = join(nuxt.options.buildDir, 'server-fn-client.ts')
    const handlerPath = join(nuxt.options.buildDir, 'server-fn-handler.ts')

    nuxt.hook('config', (options) => {
      options.build.transpile.push('nuxt-server-fn/client')
      options.build.transpile.push('#build/server-fn-client')
      options.build.transpile.push('#build/server-fn-handler')
    })

    addServerHandler({
      route: apiRoute,
      handler: handlerPath,
    })

    nuxt.hook('autoImports:extend', (imports) => {
      imports.push(
        {
          from: clientPath,
          name: 'useServerFunctions',
        },
      )
    })

    const files = Array.from(new Set(
      (await Promise.all(dirs.map(dir => fg('*.{ts,js}', { cwd: dir, absolute: true, onlyFiles: true })))).flat(),
    ))

    await fs.writeFile(functionsPath, files.map(i => `export * from ${JSON.stringify(i.replace(/\.ts$/, ''))}`).join('\n'))

    await fs.writeFile(clientPath, `
import { createServerFunctions } from 'nuxt-server-fn/client'
import type * as functions from '#build/server-fn'

/**
 * Use server functions in client.
 */
export const useServerFunctions = createServerFunctions<typeof functions>("${apiRoute}")
`.trimStart())

    await fs.writeFile(handlerPath, `
import { createServerFnAPI } from 'nuxt-server-fn/api'
${files.map((i, idx) => `import * as functions${idx} from ${JSON.stringify(i.replace(/\.ts$/, ''))}`).join('\n')}

export default createServerFnAPI(Object.assign({}, ${files.map((_, idx) => `functions${idx}`).join(', ')}))
`.trimStart())
  },
})
