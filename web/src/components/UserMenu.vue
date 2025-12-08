<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRoot,
} from 'radix-vue'

import { Button } from '~/components/ui/button'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const { t } = useI18n()

const initials = computed(() => {
  const target = user.value?.name || user.value?.email || 'User'
  return target
    .split(/\s+/)
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') || 'US'
})

const displayName = computed(() => user.value?.name || user.value?.email || t('marketing.header.userMenu.defaultName'))
const displayEmail = computed(() => user.value?.email || '')

function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <Button size="icon-sm" variant="ghost" class="h-10 w-10 rounded-full bg-primary/10 text-sm font-semibold text-primary hover:bg-primary/20">
        {{ initials }}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56 rounded-xl border border-border/70 bg-background/95 p-2 text-sm shadow-lg backdrop-blur">
      <DropdownMenuLabel class="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {{ t('marketing.header.userMenu.title') }}
      </DropdownMenuLabel>
      <DropdownMenuItem disabled class="cursor-default rounded-md px-2 py-1.5 text-xs text-muted-foreground opacity-100">
        <div class="flex flex-col">
          <span class="font-medium text-foreground">{{ displayName }}</span>
          <span class="text-xs text-muted-foreground">{{ displayEmail }}</span>
        </div>
      </DropdownMenuItem>
      <DropdownMenuSeparator class="my-1 h-px bg-border/80" />
      <DropdownMenuItem class="cursor-pointer rounded-md px-2 py-1.5 text-sm transition-colors focus:outline-none focus-visible:bg-destructive/10 focus-visible:text-destructive" @select.prevent="handleLogout">
        {{ t('marketing.header.userMenu.logout') }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenuRoot>
</template>
