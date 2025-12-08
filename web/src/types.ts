import type { App } from 'vue'
import type { Router } from 'vue-router'
import type { Pinia } from 'pinia'

import type { SsrState } from '~/composables/useSsrData'

export interface UserModuleContext {
  app: App
  router: Router
  initialState: SsrState
  isClient: boolean
  pinia?: Pinia
}

export type UserModule = (ctx: UserModuleContext) => void | Promise<void>
