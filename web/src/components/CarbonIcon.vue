<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: 'warning' | 'campsite' | 'pedestrian' | 'logo-github' | 'sun' | 'moon' | 'menu' | 'close'
}>()

const ICONS: Record<typeof props.name, { width: number; height: number; body: string }> = {
  warning: {
    width: 32,
    height: 32,
    body: '<path fill="currentColor" d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2m0 26a12 12 0 1 1 12-12a12 12 0 0 1-12 12"/><path fill="currentColor" d="M15 8h2v11h-2zm1 14a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 22"/>'
  },
  campsite: {
    width: 32,
    height: 32,
    body: '<path fill="currentColor" d="M27.562 26L17.17 8.928l2.366-3.888L17.828 4L16 7.005L14.17 4l-1.708 1.04l2.367 3.888L4.438 26H2v2h28v-2ZM16 10.85L25.22 26H17v-8h-2v8H6.78Z"/>'
  },
  pedestrian: {
    width: 32,
    height: 32,
    body: '<path fill="currentColor" d="m21.677 14l-1.245-3.114A2.99 2.99 0 0 0 17.646 9h-4.092a3 3 0 0 0-1.544.428L7 12.434V18h2v-4.434l3-1.8v11.931l-3.462 5.194L10.202 30L14 24.303V11h3.646a.995.995 0 0 1 .928.629L20.323 16H26v-2Z"/><path fill="currentColor" d="M17.051 18.316L19 24.162V30h2v-6.162l-2.051-6.154zM16.5 8A3.5 3.5 0 1 1 20 4.5A3.504 3.504 0 0 1 16.5 8m0-5A1.5 1.5 0 1 0 18 4.5A1.5 1.5 0 0 0 16.5 3"/>'
  },
  'logo-github': {
    width: 32,
    height: 32,
    body: '<path fill="currentColor" fill-rule="evenodd" d="M16 2a14 14 0 0 0-4.43 27.28c.7.13 1-.3 1-.67v-2.38c-3.89.84-4.71-1.88-4.71-1.88a3.7 3.7 0 0 0-1.62-2.05c-1.27-.86.1-.85.1-.85a2.94 2.94 0 0 1 2.14 1.45a3 3 0 0 0 4.08 1.16a2.93 2.93 0 0 1 .88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4 5.4 0 0 1 1.44-3.76a5 5 0 0 1 .14-3.7s1.17-.38 3.85 1.43a13.3 13.3 0 0 1 7 0c2.67-1.81 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.7a5.4 5.4 0 0 1 1.44 3.76c0 5.38-3.27 6.56-6.39 6.91a3.33 3.33 0 0 1 .95 2.59v3.84c0 .46.25.81 1 .67A14 14 0 0 0 16 2"/>'
  },
  sun: {
    width: 32,
    height: 32,
    body: '<path fill="currentColor" d="M16 12.005a4 4 0 1 1-4 4a4.005 4.005 0 0 1 4-4m0-2a6 6 0 1 0 6 6a6 6 0 0 0-6-6M5.394 6.813L6.81 5.399l3.505 3.506L8.9 10.319zM2 15.005h5v2H2zm3.394 10.193L8.9 21.692l1.414 1.414l-3.505 3.506zM15 25.005h2v5h-2zm6.687-1.9l1.414-1.414l3.506 3.506l-1.414 1.414zm3.313-8.1h5v2h-5zm-3.313-6.101l3.506-3.506l1.414 1.414l-3.506 3.506zM15 2.005h2v5h-2z"/>'
  },
  moon: {
    width: 32,
    height: 32,
    body: '<path fill="currentColor" d="M13.503 5.414a15.076 15.076 0 0 0 11.593 18.194a11.1 11.1 0 0 1-7.975 3.39c-.138 0-.278.005-.418 0a11.094 11.094 0 0 1-3.2-21.584M14.98 3a1 1 0 0 0-.175.016a13.096 13.096 0 0 0 1.825 25.981c.164.006.328 0 .49 0a13.07 13.07 0 0 0 10.703-5.555a1.01 1.01 0 0 0-.783-1.565A13.08 13.08 0 0 1 15.89 4.38A1.015 1.015 0 0 0 14.98 3"/>'
  },
  menu: {
    width: 32,
    height: 32,
    body: '<path fill="currentColor" d="M4 8h24v2H4zm0 7h24v2H4zm0 7h24v2H4z"/>'
  },
  close: {
    width: 32,
    height: 32,
    body: '<path fill="currentColor" d="m24.59 7.41-8.59 8.59-8.59-8.59L6 9l8.59 8.59L6 26.17L7.41 27.6l8.59-8.59l8.59 8.59l1.41-1.41l-8.59-8.59L26 9z"/>'
  }
}

const icon = computed(() => ICONS[props.name])
</script>

<template>
  <svg
    v-if="icon"
    :viewBox="`0 0 ${icon.width} ${icon.height}`"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <g v-html="icon.body" />
  </svg>
</template>
