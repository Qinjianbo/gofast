<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router/auto'
import { useI18n } from 'vue-i18n'

import {
  DropdownMenuRoot,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from 'radix-vue'

import { Button } from '~/components/ui/button'
import { useLocaleNavigation } from '~/composables/useLocaleNavigation'
import { useActiveLocale } from '~/composables/useActiveLocale'
import { availableLocales } from '~/modules/i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { activeLocale } = useActiveLocale()

const { push } = useLocaleNavigation(router, route)

const localeItems = computed(() => availableLocales.map(locale => ({
  code: locale,
  label: t(`locale.${locale}`),
  active: activeLocale.value === locale,
})))

function handleSelect(locale: string) {
  if (locale === activeLocale.value)
    return
  push({ name: '/' }, locale)
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon-sm" class="rounded-full border border-border/60">
        <span class="text-sm font-medium uppercase">{{ activeLocale.split('-')[0] }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end"
      class="w-44 rounded-xl border border-border/70 bg-background/95 p-2 text-sm shadow-lg backdrop-blur">
      <DropdownMenuLabel class="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {{ t('marketing.header.language') }}
      </DropdownMenuLabel>
      <DropdownMenuSeparator class="mb-1 h-px bg-border/80" />
      <DropdownMenuItem v-for="item in localeItems" :key="item.code" :class="[
        'flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors focus:outline-none focus-visible:bg-primary/10 focus-visible:text-primary',
        item.active ? 'bg-primary/10 text-primary' : 'text-foreground',
      ]" @select="handleSelect(item.code)">
        <span>{{ item.label }}</span>
        <span v-if="item.active" class="text-xs text-primary">{{ t('marketing.header.current') }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenuRoot>
</template>
