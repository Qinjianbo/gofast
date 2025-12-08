import { createApp, createSSRApp, watch } from 'vue'
import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import { routes as generatedRoutes } from 'vue-router/auto-routes'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'

import { createSsrDataContext, ssrDataKey, type SsrState } from '~/composables/useSsrData'
import { installModules } from '~/modules'
import { defaultLocale, getLocaleRef, installI18n, isSupportedLocale, useLocaleStore, type SupportedLocale } from '~/modules/i18n'
import { useAuthStore, type AuthLoginResponse } from '~/stores/auth'
import type { UserModuleContext } from '~/types'

import './style.css'
import './styles/main.css'

const isServer = typeof window === 'undefined'

const routes = setupLayouts([...generatedRoutes])

export function makeApp(initialState: SsrState = {}) {
  const app = isServer ? createSSRApp(App) : createApp(App)
  const router = createRouter({
    history: isServer ? createMemoryHistory() : createWebHistory(import.meta.env.BASE_URL),
    routes,
  })

  app.use(router)

  const moduleContext: UserModuleContext = {
    app,
    router,
    initialState,
    isClient: !isServer,
  }

  installModules(moduleContext)

  const pinia = moduleContext.pinia
  if (!pinia)
    throw new Error('Pinia module failed to initialize')

  const initialLocale = typeof initialState.locale === 'string' && isSupportedLocale(initialState.locale)
    ? initialState.locale
    : defaultLocale
  const i18n = installI18n(app, initialLocale)
  const localeRef = getLocaleRef(i18n)

  const ssrContext = createSsrDataContext(initialState)
  app.provide(ssrDataKey, ssrContext)

  const localeStore = useLocaleStore(pinia)
  localeStore.setLocale(initialLocale)

  if (!isServer) {
    const authStore = useAuthStore(pinia)
    const sessionState = initialState.session as AuthLoginResponse | null | undefined
    authStore.hydrateSession(sessionState ?? null)
  }

  if (isServer) {
    watch(
      pinia.state,
      (state) => {
        ssrContext.setState({
          ...ssrContext.state.value,
          pinia: JSON.parse(JSON.stringify(state)),
        })
      },
      { deep: true, immediate: true },
    )
  }

  router.beforeEach((to) => {
    const params = to.params as { locale?: unknown }
    const candidate = extractLocaleCandidate(params.locale)
    const normalizedLocale = normalizeLocaleParam(candidate)

    if (candidate && !normalizedLocale) {
      return {
        path: buildLocalizedPath(defaultLocale, to.path),
        query: to.query,
        hash: to.hash,
      }
    }

    const targetLocale = normalizedLocale ?? defaultLocale

    if (localeRef.value !== targetLocale)
      localeRef.value = targetLocale

    const currentState = ssrContext.state.value
    if (currentState.locale !== targetLocale) {
      ssrContext.setState({
        ...currentState,
        locale: targetLocale,
      })
    }

    return true
  })

  return {
    app,
    router,
    i18n,
    ssrContext,
  }
}

function extractLocaleCandidate(value: unknown): string | undefined {
  if (Array.isArray(value))
    return typeof value[0] === 'string' ? value[0] : undefined
  return typeof value === 'string' ? value : undefined
}

function normalizeLocaleParam(value: string | undefined): SupportedLocale | undefined {
  if (value && isSupportedLocale(value))
    return value
  return undefined
}

function buildLocalizedPath(locale: SupportedLocale, originalPath: string) {
  const suffix = extractPathSuffix(originalPath)
  if (locale === defaultLocale)
    return suffix || '/'
  return suffix ? `/${locale}${suffix}` : `/${locale}`
}

function extractPathSuffix(path: string) {
  if (!path || path === '/')
    return ''

  const trimmed = path.startsWith('/') ? path.slice(1) : path
  const segments = trimmed.split('/').filter(segment => segment.length > 0)
  if (segments.length <= 1)
    return ''

  return `/${segments.slice(1).join('/')}`
}
