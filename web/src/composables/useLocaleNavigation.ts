import { unref, type Ref } from 'vue'
import type { Router, RouteLocationNormalizedLoaded, RouteLocationRaw } from 'vue-router'

import { availableLocales, defaultLocale, type SupportedLocale } from '~/modules/i18n'

type MaybeString = string | number | Ref<string> | Ref<number> | Ref<string | number>
type MaybeLocale = MaybeString | null | undefined

const resolveValue = (value: MaybeString) => String(unref(value))

const resolveLocaleParam = (route: RouteLocationNormalizedLoaded) => {
  const raw = (route.params as { locale?: unknown }).locale

  if (Array.isArray(raw)) {
    for (const candidate of raw) {
      if (typeof candidate === 'string' && candidate.length > 0)
        return candidate
    }
    return undefined
  }

  if (typeof raw === 'string' && raw.length > 0)
    return raw

  return undefined
}

const resolveEffectiveLocale = (locale: MaybeLocale, route: RouteLocationNormalizedLoaded) => {
  if (locale !== null && locale !== undefined)
    return resolveValue(locale as MaybeString)

  return resolveLocaleParam(route) ?? defaultLocale
}

export function useLocaleNavigation(router: Router, currentRoute: RouteLocationNormalizedLoaded) {
  const resolveRoute = (target: RouteLocationRaw, locale?: MaybeLocale): RouteLocationRaw => {
    const effectiveLocale = resolveEffectiveLocale(locale, currentRoute)
    const resolved = router.resolve(target)

    const basePath = stripKnownLocale(resolved.path)

    const nextPath = effectiveLocale === defaultLocale
      ? basePath
      : addLocaleSegment(effectiveLocale, basePath)

    return {
      path: nextPath,
      query: resolved.query,
      hash: resolved.hash,
    }
  }

  const push = (target: RouteLocationRaw, locale?: MaybeLocale) => router.push(resolveRoute(target, locale))

  return {
    resolveRoute,
    push,
  }
}

function stripKnownLocale(pathValue: string) {
  const normalized = ensureLeadingSlash(pathValue)
  const segments = normalized.split('/').filter(Boolean)
  if (segments.length === 0)
    return '/'

  if (isSupportedLocaleSegment(segments[0]))
    segments.shift()

  const joined = segments.join('/')
  return joined ? `/${joined}` : '/'
}

function addLocaleSegment(locale: string, pathValue: string) {
  const normalized = ensureLeadingSlash(pathValue)
  if (normalized === '/' || normalized === '')
    return `/${locale}`
  return `/${locale}${normalized}`
}

function ensureLeadingSlash(pathValue: string) {
  if (!pathValue)
    return '/'
  return pathValue.startsWith('/') ? pathValue : `/${pathValue}`
}

function isSupportedLocaleSegment(value: string): value is SupportedLocale {
  return availableLocales.includes(value as SupportedLocale)
}
