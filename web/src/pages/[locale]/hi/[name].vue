<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router/auto'
import { useI18n } from 'vue-i18n'

import { useSsrData } from '~/composables/useSsrData'
import { useLocaleNavigation } from '~/composables/useLocaleNavigation'

const route = useRoute()
const params = useRoute('/[locale]/hi/[name]').params
const router = useRouter()
const { push } = useLocaleNavigation(router, route)
const ssrData = useSsrData<{ greeting?: string; generatedAt?: string }>()
const { t } = useI18n()

const resolvedName = computed(() => {
  const raw = params.name
  if (Array.isArray(raw))
    return raw[0] ?? ''
  return raw ?? ''
})

const displayName = computed(() => resolvedName.value || t('hi.fallbackName'))

const greeting = computed(() => ssrData.value.greeting ?? t('hi.greeting', { name: displayName.value }))
const generatedAt = computed(() => ssrData.value.generatedAt)

function goBack() {
  push({ name: '/' })
}
</script>

<template>
  <div>
    <div class="mb-2 flex justify-center">
      <CarbonIcon name="pedestrian" class="h-10 w-10" />
    </div>
    <p>
      {{ greeting }}
    </p>
    <p class="text-sm opacity-50">
      <em>{{ t('hi.subtitle') }}</em>
    </p>

    <p v-if="generatedAt" class="text-xs opacity-40">
      {{ t('hi.generatedAt') }}: {{ generatedAt }}
    </p>

    <div>
      <button
        class="m-3 mt-8 inline-flex items-center justify-center rounded bg-teal-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-0 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50"
        @click="goBack()"
      >
        {{ t('hi.back') }}
      </button>
    </div>
  </div>
</template>
