import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { myFetch } from '~/lib/api'

interface AuthUser {
  id: string
  name: string
  email: string
  provider: 'google' | 'email'
}

type AuthStatus = 'idle' | 'sending-code' | 'verifying' | 'authenticated'

export interface AuthLoginResponse {
  session_token: string
  user: AuthUser
}

interface AuthEmailResponse {
  message: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const status = ref<AuthStatus>('idle')
  const emailForVerification = ref<string | null>(null)
  const message = ref<string>('')
  const sessionToken = ref<string>('')

  const isAuthenticated = computed(() => user.value !== null)

  function resetMessages() {
    message.value = ''
  }

  function consumeMessage(expected?: string): string | null {
    const current = message.value
    if (!current)
      return null

    if (expected && current !== expected)
      return null

    message.value = ''
    return current
  }

  async function loginWithGoogle(payload?: { code?: string; accessToken?: string }) {
    resetMessages()
    const response = await myFetch<AuthLoginResponse>('/api/auth/login/google', {
      method: 'POST',
      body: payload ? JSON.stringify({
        code: payload.code,
        access_token: payload.accessToken,
      }) : undefined,
    })
    applySession(response)
  }

  async function requestEmailCode(email: string) {
    resetMessages()
    status.value = 'sending-code'
    try {
      await myFetch<AuthEmailResponse>('/api/auth/login/email/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      emailForVerification.value = email
      message.value = 'code-sent'
      status.value = 'idle'
    }
    catch (error) {
      status.value = 'idle'
      throw error
    }
  }

  async function verifyEmailCode(code: string) {
    if (!emailForVerification.value)
      throw new Error('missing-email')

    resetMessages()
    status.value = 'verifying'
    try {
      const payload = await myFetch<AuthLoginResponse>('/api/auth/login/email/verify', {
        method: 'POST',
        body: JSON.stringify({ email: emailForVerification.value, code }),
      })
      applySession(payload)
    }
    catch (error) {
      status.value = 'idle'
      throw error
    }
  }

  function logout() {
    myFetch<AuthEmailResponse>('/api/auth/logout', { method: 'POST' }).catch(() => {})
    clearSession()
  }

  function applySession(payload: AuthLoginResponse) {
    user.value = {
      ...payload.user,
    }
    sessionToken.value = payload.session_token
    status.value = 'authenticated'
    message.value = 'signed-in'
    emailForVerification.value = null
  }

  async function hydrateSession(initial?: AuthLoginResponse | null) {
    if (initial && initial.session_token) {
      applySession(initial)
      return
    }

    try {
      const data = await myFetch<AuthLoginResponse>('/api/auth/session', {
        method: 'GET',
      })
      if (data?.session_token)
        applySession(data)
      else
        clearSession()
    }
    catch {
      clearSession()
    }
  }

  function clearSession() {
    user.value = null
    sessionToken.value = ''
    message.value = ''
    emailForVerification.value = null
    status.value = 'idle'
  }

  return {
    user,
    status,
    message,
    emailForVerification,
    sessionToken,
    isAuthenticated,
    consumeMessage,
    hydrateSession,
    loginWithGoogle,
    requestEmailCode,
    verifyEmailCode,
    logout,
  }
})
