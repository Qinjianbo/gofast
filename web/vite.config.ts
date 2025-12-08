/// <reference types="vitest" />

import path from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import tailwindcss from '@tailwindcss/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import VueRouter from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import Layouts from 'vite-plugin-vue-layouts'

const lifecycleEvent = process.env.npm_lifecycle_event
const cdnEnv = process.env.CND_URL ?? process.env.CDN_URL
const normalizedCdnBase = cdnEnv ? `${cdnEnv.replace(/\/?$/, '/')}` : undefined

const base = lifecycleEvent === 'build:client' && normalizedCdnBase
  ? normalizedCdnBase
  : '/'

export default defineConfig({
  base,
  server: {
    host: '127.0.0.1',
    port: 3333,
    proxy: {
      '/__ssr_data': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/__ssr_fetch': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
    },
  },
  plugins: [
    VueMacros({
      defineOptions: false,
      defineModels: false,
      plugins: {
        vue: Vue({
          script: {
            propsDestructure: true,
            defineModel: true,
          },
        }),
      },
    }),

    // https://github.com/posva/unplugin-vue-router
    VueRouter({
      extensions: ['.vue', '.md'],
      dts: 'src/typed-router.d.ts',
    }),
    Layouts(),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        '@vueuse/core',
        VueRouterAutoImports,
        {
          // add any other imports you were relying on
          'vue-router/auto': ['useLink'],
        },
      ],
      dts: true,
      dirs: [
        './src/composables',
      ],
      vueTemplate: true,
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      dts: true,
    }),

    tailwindcss(),
  ],

  // https://github.com/vitest-dev/vitest
  test: {
    environment: 'jsdom',
  },
})
