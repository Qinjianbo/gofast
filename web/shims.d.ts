declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare module 'virtual:generated-layouts' {
  import type { RouteRecordRaw } from 'vue-router'

  export function setupLayouts(routes: RouteRecordRaw[]): RouteRecordRaw[]
}

declare module 'vite-plugin-vue-layouts' {
  import type { Plugin } from 'vite'

  interface VueLayoutsOptions {
    defaultLayout?: string
    layoutsDirs?: string | string[]
    pagesDirs?: string | string[]
    extensions?: string[]
    debug?: boolean
  }

  export default function Layouts(options?: VueLayoutsOptions): Plugin
}
