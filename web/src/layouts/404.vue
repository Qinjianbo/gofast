<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

useTitle(() => t('not-found'))
</script>

<template>
  <main class="px-4 py-10 text-center text-teal-700 dark:text-gray-200">
    <div class="flex justify-center text-4xl">
      <CarbonIcon name="warning" class="h-10 w-10" />
    </div>
    <RouterView />
    <div>
      <button
        class="m-3 mt-8 inline-flex items-center justify-center rounded bg-teal-600 px-4 py-1 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-0 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50"
        @click="router.back()"
      >
        {{ t('button.back') }}
      </button>
    </div>
  </main>
</template>
