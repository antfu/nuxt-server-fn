import { defineNuxtConfig } from 'nuxt'
import MyModule from '../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  myModule: {
    addPlugin: true,
  },
})
