import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

type ToastVariant = 'info' | 'error'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
  duration: number
}

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([])

  function push(message: string, variant: ToastVariant = 'info', duration = 4000) {
    if (!message)
      return

    const id = Date.now() + Math.random()
    items.value.push({ id, message, variant, duration })
    window.setTimeout(() => remove(id), duration)
  }

  function error(message: string) {
    push(message, 'error')
  }

  function remove(id: number) {
    items.value = items.value.filter(item => item.id !== id)
  }

  const toasts = computed(() => items.value)

  return {
    toasts,
    push,
    error,
    remove,
  }
})
