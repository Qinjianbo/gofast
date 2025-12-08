<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router/auto'

import { useLocaleNavigation } from '~/composables/useLocaleNavigation'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const { push } = useLocaleNavigation(router, route)

function goHome() {
  push({ name: '/' })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">{{ t('notFound.title') }}</h1>
    <p class="mt-2 text-sm opacity-60">
      {{ t('notFound.subtitle') }}
    </p>
    <div>
      <button
        class="m-3 mt-6 inline-flex items-center justify-center rounded bg-teal-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-0 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50"
        @click="goHome()"
      >
        {{ t('notFound.back') }}
      </button>
    </div>
  </div>
</template>
