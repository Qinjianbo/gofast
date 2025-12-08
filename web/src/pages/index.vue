<script setup lang="ts">
import LocaleIndexPage from './[locale]/index.vue'

defineOptions({
  name: 'IndexPage',
})
</script>

<template>
  <LocaleIndexPage />
</template>

<route lang="yaml">
meta:
  layout: home
</route>
