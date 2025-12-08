<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { availableLocales } from '~/modules/i18n'
import { useLocaleNavigation } from '~/composables/useLocaleNavigation'
import { useRoute, useRouter } from 'vue-router/auto'

const router = useRouter()
const route = useRoute()
const { resolveRoute } = useLocaleNavigation(router, route)

const homeLocation = (locale?: string) => resolveRoute({ name: '/', query: route.query, hash: route.hash }, locale)

const { t } = useI18n()

const productLinks = [
  { labelKey: 'marketing.footer.product.overview', href: '#features' },
  { labelKey: 'marketing.footer.product.security', href: '#security' },
  { labelKey: 'marketing.footer.product.integrations', href: '#integrations' },
]

const companyLinks = [
  { labelKey: 'marketing.footer.company.about', href: '#about' },
  { labelKey: 'marketing.footer.company.blog', href: '#resources' },
  { labelKey: 'marketing.footer.company.careers', href: '#careers' },
]

const legalLinks = [
  { labelKey: 'marketing.footer.legal.privacy', href: '#privacy' },
  { labelKey: 'marketing.footer.legal.terms', href: '#terms' },
  { labelKey: 'marketing.footer.legal.cookies', href: '#cookies' },
]
</script>

<template>
  <footer class="border-t border-border/80 bg-muted/40">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
      <div class="space-y-3">
        <div class="flex items-center gap-2 text-lg font-semibold text-primary">
          <span class="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">SaaSwift</span>
        </div>
        <p class="text-sm text-muted-foreground">
          {{ t('marketing.footer.tagline') }}
        </p>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-foreground">{{ t('marketing.footer.product.title') }}</h3>
        <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
          <li v-for="item in productLinks" :key="item.labelKey">
            <a :href="item.href" class="transition-colors hover:text-foreground">{{ t(item.labelKey) }}</a>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-foreground">{{ t('marketing.footer.company.title') }}</h3>
        <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
          <li v-for="item in companyLinks" :key="item.labelKey">
            <a :href="item.href" class="transition-colors hover:text-foreground">{{ t(item.labelKey) }}</a>
          </li>
        </ul>
      </div>

      <div>
        <h3 class="text-sm font-semibold text-foreground">{{ t('marketing.footer.legal.title') }}</h3>
        <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
          <li v-for="item in legalLinks" :key="item.labelKey">
            <a :href="item.href" class="transition-colors hover:text-foreground">{{ t(item.labelKey) }}</a>
          </li>
        </ul>
      </div>
    </div>

  <div class="border-t border-border/60 bg-muted/30">
      <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {{ new Date().getFullYear() }} SaaSwift. {{ t('marketing.footer.rights') }}</p>
        <nav class="flex flex-wrap items-center gap-3">
          <a class="transition-colors hover:text-foreground" href="https://github.com/antfu/vitesse-lite" target="_blank" rel="noreferrer">
            {{ t('marketing.footer.links.github') }}
          </a>
          <a class="transition-colors hover:text-foreground" href="#contact">
            {{ t('marketing.footer.links.contact') }}
          </a>
          <span class="hidden text-border/60 sm:inline">•</span>
          <RouterLink
            v-for="locale in availableLocales"
            :key="locale"
            :to="homeLocation(locale)"
            class="rounded px-1 py-0.5 transition-colors hover:text-foreground"
          >
            {{ t(`marketing.footer.languages.${locale}`) }}
          </RouterLink>
        </nav>
      </div>
    </div>
  </footer>
</template>
