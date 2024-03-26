import { join, relative, resolve } from 'node:path'
import { addImports, addServerHandler, addTemplate, defineNuxtModule } from '@nuxt/kit'
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
    const extGlob = '*.{ts,js}'
    const dirs = [
      // TODO: read from extends
      join(nuxt.options.rootDir, 'server/functions'),
    ]
    const clientPath = join(nuxt.options.buildDir, 'server-fn-client.ts')
    const handlerPath = join(nuxt.options.buildDir, 'server-fn-handler.ts')

    const files: string[] = []

    nuxt.options.vite ??= {}
    nuxt.options.vite.optimizeDeps ??= {}
    nuxt.options.vite.optimizeDeps.exclude ??= []
    nuxt.options.vite.optimizeDeps.exclude.push('nuxt-server-fn')

    nuxt.hook('builder:watch', async (e, path) => {
      path = relative(nuxt.options.srcDir, resolve(nuxt.options.srcDir, path))
      if (e === 'change')
        return
      const abs = join(nuxt.options.rootDir, path)
      if (files.includes(abs) || dirs.some(dir => abs.startsWith(dir))) {
        await scanServerFunctions()
        await nuxt.callHook('builder:generateApp')
      }
    })

    addImports({
      from: clientPath,
      name: 'useServerFunctions',
    })

    addServerHandler({
      route: apiRoute,
      handler: handlerPath,
    })

    await scanServerFunctions()

    addTemplate({
      filename: 'server-fn.ts',
      write: true,
      options: { files },
      getContents() {
        return files.map(i => `export * from ${JSON.stringify(i.replace(/\.ts$/, ''))}`).join('\n')
      },
    })

    addTemplate({
      filename: 'server-fn-client.ts',
      write: true,
      getContents() {
        return `
import { createServerFunctions } from 'nuxt-server-fn/client'
import type * as functions from '#build/server-fn'

/**
 * Use server functions in client.
 */
export const useServerFunctions = createServerFunctions<typeof functions>("${apiRoute}")
`.trimStart()
      },
    })

    addTemplate({
      filename: 'server-fn-handler.ts',
      write: true,
      options: { files },
      getContents() {
        return `
import { createServerFnAPI } from 'nuxt-server-fn/api'
${files.map((i, idx) => `import * as functions${idx} from ${JSON.stringify(i.replace(/\.ts$/, ''))}`).join('\n')}

export default createServerFnAPI(Object.assign({}, ${files.map((_, idx) => `functions${idx}`).join(', ')}))
`.trimStart()
      },
    })

    async function scanServerFunctions() {
      files.length = 0
      files.push(...new Set(
        (await Promise.all(
          dirs.map(dir => fg(extGlob, { cwd: dir, absolute: true, onlyFiles: true })),
        )
        ).flat(),
      ))
      return files
    }
  },
})
