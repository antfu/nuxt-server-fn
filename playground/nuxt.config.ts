import { defineNuxtConfig } from 'nuxt'
import serverFn from '../src/module'

export default defineNuxtConfig({
  modules: [
    serverFn,
  ],
})
