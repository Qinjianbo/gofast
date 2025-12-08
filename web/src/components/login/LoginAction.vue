<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useTokenClient } from 'vue3-google-signin'

import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogClose,
} from 'radix-vue'

import { Button } from '~/components/ui/button'
import { useAuthStore } from '~/stores/auth'
import { useToastStore } from '~/stores/toast'

const emit = defineEmits<{
  execute: []
  login: [payload: { email: string; name: string }]
}>()

const authStore = useAuthStore()
const toastStore = useToastStore()
const { t } = useI18n()
const { isAuthenticated, status, user, message } = storeToRefs(authStore)

const open = ref(false)
const step = ref<'options' | 'email' | 'verify'>('options')
const email = ref('')
const code = ref('')
const error = ref('')
const info = ref('')
const googleReady = ref(false)

let requestGoogleLogin: (() => void | undefined) | undefined

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

if (!import.meta.env.SSR && googleClientId) {
  const { isReady, login } = useTokenClient({
    scope: ['profile', 'email'],
    onSuccess: async (response) => {
      try {
        await authStore.loginWithGoogle({
          accessToken: response.access_token,
        })
      }
      catch (err) {
        handleError(err)
      }
    },
    onError: () => {
      handleError(new Error('google-login-failed'))
    },
  })

  requestGoogleLogin = login

  watch(isReady, (value) => {
    googleReady.value = value
  }, { immediate: true })
}
else if (!import.meta.env.SSR) {
  googleReady.value = false
}

const isProcessing = computed(() => status.value === 'sending-code' || status.value === 'verifying')

function resetForm() {
  step.value = 'options'
  email.value = ''
  code.value = ''
  error.value = ''
  info.value = ''
}

function closeDialog() {
  open.value = false
  resetForm()
}

function handleTrigger() {
  if (open.value)
    return

  if (isAuthenticated.value) {
    emit('execute')
    return
  }

resetForm()
  open.value = true
}

async function handleGoogleLogin() {
  error.value = ''
  info.value = ''

  if (!googleReady.value || !requestGoogleLogin) {
    handleError(new Error('google-login-failed'))
    return
  }

  try {
    requestGoogleLogin()
  }
  catch (err) {
    handleError(err)
  }
}

async function handleSendCode() {
  error.value = ''
  info.value = ''
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = t('login.error.invalidEmail')
    return
  }
  try {
    await authStore.requestEmailCode(email.value)
    step.value = 'verify'
    info.value = t('login.info.sentDetailed')
  }
  catch (err) {
    handleError(err)
  }
}

async function handleVerifyCode() {
  error.value = ''
  info.value = ''
  if (!code.value.trim()) {
    error.value = t('login.error.missingCode')
    return
  }

  try {
    await authStore.verifyEmailCode(code.value.trim())
  }
  catch (err) {
    handleError(err)
  }
}

watch(isAuthenticated, (value) => {
  if (!value)
    return

  if (open.value)
    closeDialog()

  if (user.value)
    emit('login', { email: user.value.email, name: user.value.name })

  emit('execute')
})

watch(message, (val) => {
  if (!val)
    return

  const consumed = authStore.consumeMessage(val)
  if (!consumed)
    return

  if (consumed === 'code-sent') {
    const text = t('login.info.sent')
    info.value = text
    toastStore.push(text)
  }

  if (consumed === 'signed-in')
    toastStore.push(t('login.success'))
})

function normalizeError(err: unknown) {
  if (err instanceof Error) {
    switch (err.message) {
      case 'google-login-failed':
        return t('login.error.google')
      case 'send-code-failed':
        return t('login.error.sendCode')
      case 'invalid-code':
        return t('login.error.invalidCode')
      case 'missing-email':
        return t('login.error.invalidEmail')
      case 'invalid-response':
        return t('login.error.generic')
      case 'network-error':
        return t('login.error.network')
      default:
        return err.message || t('login.error.generic')
    }
  }
  return t('login.error.generic')
}

function handleError(err: unknown) {
  const msg = normalizeError(err)
  error.value = msg
  info.value = ''
  toastStore.error(msg)
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <span class="contents" @click="handleTrigger">
      <slot />
    </span>

    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
      <DialogContent class="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/80 bg-background p-6 shadow-xl">
        <div class="flex items-center justify-between">
          <div>
            <DialogTitle class="text-lg font-semibold text-foreground">{{ t('login.title') }}</DialogTitle>
            <DialogDescription class="text-sm text-muted-foreground">
              {{ t('login.subtitle') }}
            </DialogDescription>
          </div>
          <DialogClose as-child>
            <button class="h-8 w-8 rounded-full text-muted-foreground transition hover:bg-muted" :aria-label="t('login.actions.close')">
              ✕
            </button>
          </DialogClose>
        </div>

        <div class="mt-6 space-y-6">
          <template v-if="step === 'options'">
            <Button class="w-full" size="lg" :disabled="!googleReady" @click="handleGoogleLogin">
              {{ t('login.actions.google') }}
            </Button>
            <div class="text-center text-xs uppercase tracking-wide text-muted-foreground">{{ t('login.or') }}</div>
            <Button class="w-full" variant="outline" size="lg" @click="step = 'email'">
              {{ t('login.actions.email') }}
            </Button>
          </template>

          <template v-else-if="step === 'email'">
            <div class="space-y-4">
              <label class="block text-sm font-medium text-foreground" for="login-email">{{ t('login.emailLabel') }}</label>
              <input
                id="login-email"
                v-model="email"
                type="email"
                :placeholder="t('login.emailPlaceholder')"
                class="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
              <div class="flex items-center gap-2">
                <Button class="flex-1" :disabled="isProcessing" @click="handleSendCode">
                  {{ isProcessing ? t('login.actions.sending') : t('login.actions.sendCode') }}
                </Button>
                <Button type="button" variant="ghost" @click="step = 'options'">
                  {{ t('login.actions.back') }}
                </Button>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="space-y-4">
              <label class="block text-sm font-medium text-foreground" for="login-code">{{ t('login.codeLabel') }}</label>
              <input
                id="login-code"
                v-model="code"
                inputmode="numeric"
                maxlength="6"
                :placeholder="t('login.codePlaceholder')"
                class="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
              <Button class="w-full" :disabled="isProcessing" @click="handleVerifyCode">
                {{ isProcessing ? t('login.actions.verifying') : t('login.actions.verify') }}
              </Button>
              <Button type="button" variant="ghost" class="w-full" @click="step = 'email'">
                {{ t('login.actions.changeEmail') }}
              </Button>
            </div>
          </template>

          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <p v-else-if="info" class="text-xs text-muted-foreground">{{ info }}</p>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
