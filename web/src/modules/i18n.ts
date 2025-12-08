import { createI18n } from 'vue-i18n'
import type { App, WritableComputedRef } from 'vue'
import { defineStore } from 'pinia'

const localeModules = import.meta.glob('../locales/*.json', {
  eager: true,
}) as Record<string, { default: Record<string, string> }>

type MessageMap = Record<string, Record<string, string>>

const messageMap: MessageMap = Object.fromEntries(
  Object.entries(localeModules)
    .map(([path, module]) => {
      const match = path.match(/([\w-]+)\.json$/)
      return match ? [match[1], module.default] : null
    })
    .filter((entry): entry is [string, Record<string, string>] => Array.isArray(entry)),
) as MessageMap

const localeKeys = Object.keys(messageMap)

export type SupportedLocale = (typeof localeKeys)[number]

export const availableLocales = localeKeys as SupportedLocale[]

const preferredDefault = availableLocales.includes('en' as SupportedLocale)
  ? ('en' as SupportedLocale)
  : availableLocales[0]

export const defaultLocale = (preferredDefault ?? 'en') as SupportedLocale

interface LocaleState {
  current: SupportedLocale
}

export const useLocaleStore = defineStore('locale', {
  state: (): LocaleState => ({
    current: defaultLocale,
  }),
  getters: {
    currentLocale: state => state.current,
  },
  actions: {
    setLocale(locale: string) {
      this.current = isSupportedLocale(locale) ? locale : defaultLocale
    },
  },
})

export function createI18nInstance(initialLocale: SupportedLocale = defaultLocale) {
  const locale = isSupportedLocale(initialLocale) ? initialLocale : defaultLocale

  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: defaultLocale,
    messages: messageMap,
  })
}

export function installI18n(app: App, initialLocale?: SupportedLocale) {
  const i18n = createI18nInstance(initialLocale)
  app.use(i18n)
  return i18n
}

export function isSupportedLocale(locale: unknown): locale is SupportedLocale {
  return typeof locale === 'string' && availableLocales.includes(locale as SupportedLocale)
}

export type I18nInstance = ReturnType<typeof createI18nInstance>

export function getLocaleRef(i18n: I18nInstance): WritableComputedRef<SupportedLocale> {
  return i18n.global.locale as WritableComputedRef<SupportedLocale>
}
