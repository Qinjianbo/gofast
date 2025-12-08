<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router/auto'

import { useActiveLocale } from '~/composables/useActiveLocale'
import { useSsrData } from '~/composables/useSsrData'
import { availableLocales, defaultLocale, type SupportedLocale } from '~/modules/i18n'

const route = useRoute()
const { activeLocale } = useActiveLocale()
const ssrData = useSsrData<{ siteOrigin?: string }>()

const origin = computed(() => {
  const raw = ssrData.value.siteOrigin
  if (typeof raw === 'string' && raw)
    return raw.replace(/\/+$/, '')
  if (typeof window !== 'undefined')
    return window.location.origin.replace(/\/+$/, '')
  return ''
})

const suffix = computed(() => {
  const path = route.path || '/'
  const trimmed = path.startsWith('/') ? path.slice(1) : path
  const segments = trimmed.split('/').filter(Boolean)
  if (segments.length <= 1)
    return ''
  return `/${segments.slice(1).join('/')}`
})

const hasLocaleParam = computed(() => {
  const params = route.params as { locale?: unknown }
  const value = params.locale
  if (Array.isArray(value))
    return typeof value[0] === 'string'
  return typeof value === 'string'
})

function buildLocalizedPath(locale: SupportedLocale) {
  const tail = suffix.value
  const hasLocale = hasLocaleParam.value

  if (!hasLocale && locale === defaultLocale && tail === '')
    return '/'

  return tail ? `/${locale}${tail}` : `/${locale}`
}

const queryString = computed(() => {
  const params = new URLSearchParams()
  Object.entries(route.query).forEach(([key, value]) => {
    if (value == null)
      return
    if (Array.isArray(value))
      value.forEach(item => params.append(key, `${item}`))
    else
      params.append(key, `${value}`)
  })

  const query = params.toString()
  return query ? `?${query}` : ''
})

const hash = computed(() => route.hash ?? '')

function buildAbsoluteUrl(locale: SupportedLocale) {
  const path = buildLocalizedPath(locale)
  return `${origin.value}${path}${queryString.value}${hash.value}`
}

const canonicalUrl = computed(() => buildAbsoluteUrl(activeLocale.value))

const alternateLinks = computed(() => {
  return availableLocales.map(locale => ({
    locale,
    url: buildAbsoluteUrl(locale),
  }))
})

const xDefaultUrl = computed(() => buildAbsoluteUrl(defaultLocale))
const htmlLang = computed(() => activeLocale.value)

watchEffect(() => {
  if (typeof document === 'undefined')
    return
  document.documentElement.lang = htmlLang.value
})
</script>

<template>
  <Teleport to="head">
    <link v-if="canonicalUrl" rel="canonical" :href="canonicalUrl" />
    <link
      v-for="item in alternateLinks"
      :key="item.locale"
      rel="alternate"
      :href="item.url"
      :hreflang="item.locale"
    />
    <link v-if="xDefaultUrl" rel="alternate" hreflang="x-default" :href="xDefaultUrl" />
    <meta v-if="htmlLang" property="og:locale" :content="htmlLang" />
  </Teleport>
</template>
