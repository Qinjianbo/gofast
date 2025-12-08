import { createPinia } from 'pinia'
import type { StateTree } from 'pinia'

import type { UserModule } from '~/types'

function isStateTree(value: unknown): value is StateTree {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const install: UserModule = (ctx) => {
  const pinia = ctx.pinia ?? createPinia()

  if (!ctx.pinia)
    ctx.app.use(pinia)

  if (ctx.isClient) {
    const storedState = ctx.initialState.pinia
    if (isStateTree(storedState))
      pinia.state.value = storedState
  }
  else {
    ctx.initialState.pinia = pinia.state.value
  }

  ctx.pinia = pinia
}
