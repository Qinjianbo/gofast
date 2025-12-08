import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router/auto'
import { useI18n } from 'vue-i18n'

import { defaultLocale, isSupportedLocale, useLocaleStore, type SupportedLocale } from '~/modules/i18n'

export function useActiveLocale() {
  const route = useRoute()
  const { locale } = useI18n()
  const localeStore = useLocaleStore()

  const activeLocale = computed<SupportedLocale>(() => {
    const params = route.params as { locale?: unknown }
    const raw = params.locale

    const resolved = Array.isArray(raw) ? raw[0] : raw
    if (typeof resolved === 'string' && isSupportedLocale(resolved))
      return resolved

    return defaultLocale
  })

  watchEffect(() => {
    const target = activeLocale.value
    if (locale.value !== target)
      locale.value = target
    localeStore.setLocale(target)
  })

  return {
    activeLocale,
    locale,
  }
}
