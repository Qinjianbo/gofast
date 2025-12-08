<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router/auto'

import { useActiveLocale } from '~/composables/useActiveLocale'
import { availableLocales, type SupportedLocale } from '~/modules/i18n'
import { isDark, toggleDark } from '~/composables/dark'

const router = useRouter()
const route = useRoute()
const { locale, t } = useI18n()
const { activeLocale } = useActiveLocale()

const localeLabel = computed(() => t(`locale.${locale.value}`))
const localeOptions = computed(() => availableLocales.map(code => ({
  code,
  label: t(`locale.${code}`),
})))

const showLocaleControl = computed(() => availableLocales.length > 1)
const useToggleButton = computed(() => availableLocales.length === 2)
const alternateLocale = computed<SupportedLocale | null>(() => {
  if (availableLocales.length !== 2)
    return null

  const current = activeLocale.value
  return (availableLocales.find(code => code !== current) as SupportedLocale | undefined) ?? current
})

const selectedLocale = computed<SupportedLocale>({
  get: () => activeLocale.value,
  set: (value) => {
    navigateToLocale(value)
  },
})

function buildLocalePath(targetLocale: SupportedLocale) {
  const suffix = route.path.replace(/^\/[^/]+/, '')
  const normalizedSuffix = suffix === '/' ? '' : suffix || ''
  const basePath = normalizedSuffix ? `/${targetLocale}${normalizedSuffix}` : `/${targetLocale}`

  const queryEntries: Record<string, string | string[]> = {}
  for (const [key, value] of Object.entries(route.query)) {
    if (value == null)
      continue
    queryEntries[key] = Array.isArray(value) ? value.map(item => `${item}`) : `${value}`
  }

  return {
    path: basePath,
    query: queryEntries,
    hash: route.hash,
  }
}

function navigateToLocale(targetLocale: SupportedLocale) {
  if (targetLocale === activeLocale.value)
    return

  locale.value = targetLocale
  router.push(buildLocalePath(targetLocale))
}

function toggleLocale() {
  const target = alternateLocale.value
  if (!target)
    return

  navigateToLocale(target)
}
</script>

<template>
  <nav class="mt-6 inline-flex items-center gap-2 text-xl">
    <button
      :title="t('footer.toggleDark')"
      class="inline-flex h-9 w-9 items-center justify-center rounded-full text-[0.9em] opacity-75 transition hover:text-teal-600 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      @click="toggleDark()"
    >
      <CarbonIcon :name="isDark ? 'moon' : 'sun'" class="h-5 w-5" />
    </button>

    <template v-if="showLocaleControl">
      <button
        v-if="useToggleButton"
        :title="t('footer.toggleLocale')"
        class="inline-flex items-center justify-center rounded px-3 py-1 text-sm font-semibold opacity-80 transition hover:bg-teal-50 hover:text-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:bg-slate-800/70"
        @click="toggleLocale()"
      >
        {{ localeLabel }}
      </button>
      <select
        v-else
        v-model="selectedLocale"
        class="rounded border border-transparent bg-transparent px-2 py-1 text-sm font-semibold hover:border-gray-400/50 focus:border-gray-500/60 focus:outline-none dark:hover:border-slate-200/40"
        :title="t('footer.toggleLocale')"
      >
        <option
          v-for="option in localeOptions"
          :key="option.code"
          :value="option.code"
        >
          {{ option.label }}
        </option>
      </select>
    </template>

    <a
      class="inline-flex h-9 w-9 items-center justify-center rounded-full text-[0.9em] opacity-75 transition hover:text-teal-600 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
      rel="noreferrer"
      href="https://github.com/antfu/vitesse-lite"
      target="_blank"
      title="GitHub"
    >
      <CarbonIcon name="logo-github" class="h-5 w-5" />
    </a>
  </nav>
</template>
