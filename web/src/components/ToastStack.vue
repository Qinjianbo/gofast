<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useToastStore } from '~/stores/toast'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)

function closeToast(id: number) {
  toastStore.remove(id)
}
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6">
    <transition-group name="toast" tag="div" class="flex w-full flex-col items-center gap-3 sm:items-end">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg sm:w-auto',
          toast.variant === 'error'
            ? 'border-destructive/50 bg-destructive/10 text-destructive'
            : 'border-border/70 bg-background/95 text-foreground',
        ]"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="text-sm leading-5">{{ toast.message }}</p>
          <button
            type="button"
            class="text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            @click="closeToast(toast.id)"
          >
            ×
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
