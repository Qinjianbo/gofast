import { watch } from 'vue'

import { makeApp } from '~/main'
import type { SsrState } from '~/composables/useSsrData'
import { availableLocales, getLocaleRef, isSupportedLocale } from '~/modules/i18n'

declare global {
  interface Window {
    __SSR_DATA__?: SsrState
  }
}

const ssrPayload = window.__SSR_DATA__
const hadInitialSsrPayload = !!ssrPayload && Object.keys(ssrPayload).length > 0
const initialState = ssrPayload ?? {}
const { app, router, ssrContext, i18n } = makeApp(initialState)

if (typeof window !== 'undefined') {
  const savedLocale = window.localStorage.getItem('locale')
  const localeRef = getLocaleRef(i18n)

  if (savedLocale && isSupportedLocale(savedLocale))
    localeRef.value = savedLocale

  document.documentElement.setAttribute('lang', localeRef.value)

  watch(localeRef, (newLocale) => {
    if (availableLocales.includes(newLocale)) {
      window.localStorage.setItem('locale', newLocale)
      document.documentElement.setAttribute('lang', newLocale)
    }
  })
}
const fullPath = window.location.pathname + window.location.search

let isFirstNavigation = true

router.beforeResolve(async (to: { fullPath: string }, from: { fullPath: any }, next: () => void) => {
  if (isFirstNavigation) {
    isFirstNavigation = false
    return next()
  }

  if (to.fullPath === from.fullPath)
    return next()

  try {
    const data = await fetchSsrData(to.fullPath)
    ssrContext.setState({
      ...ssrContext.state.value,
      ...data,
    })
    next()
  }
  catch (error) {
    console.error('Failed to fetch SSR data', error)
    ssrContext.setState({})
    next()
  }
})

router.replace(fullPath)
router.isReady().then(async () => {
  if (!hadInitialSsrPayload) {
    try {
      const initialData = await fetchSsrData(router.currentRoute.value.fullPath)
      ssrContext.setState({
        ...ssrContext.state.value,
        ...initialData,
      })
    }
    catch (error) {
      console.error('Failed to fetch initial SSR data', error)
      ssrContext.setState({})
    }
  }

  app.mount('#app', true)
  delete window.__SSR_DATA__
})

async function fetchSsrData(path: string): Promise<Record<string, unknown>> {
  const url = new URL(path, window.location.origin)
  const endpoint = `/__ssr_fetch${url.pathname}${url.search}`
  const response = await fetch(endpoint, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'X-SSR-Fetch': '1',
    },
  })

  if (!response.ok)
    throw new Error(`Request failed with status ${response.status}`)

  const data = await response.json()
  if (data && typeof data === 'object')
    return data as Record<string, unknown>

  return {}
}
