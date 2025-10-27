// src/composables/useAuth.ts
import { ref, computed } from 'vue'

import { getCurrentUser } from '@/network/authService'
import { useSocketStore } from '@/stores/socketStore'

interface UserInfo {
  id: string
  account: string
  nickname: string
}
const user = ref<UserInfo | null>(null)
const guestId = ref<string | null>(localStorage.getItem('guest_id'))

export function useAuth() {
  const socketStore = useSocketStore()
  const isLoggedIn = computed(() => !!user.value)
  const isGuest    = computed(() => !!guestId.value && !user.value)

  function proceedAsGuest() {
    console.info(`[AUTH] Proceed as guestId:`, guestId);
    if (!guestId.value) {
      guestId.value = `guest_${Math.random().toString(36).slice(2, 8)}`
      localStorage.setItem('guest_id', guestId.value)
      localStorage.removeItem('auth_token')
    }

    socketStore.connect(undefined, guestId.value)
  }

  function login(userInfo: UserInfo, token: string) {
    console.info(`[AUTH] Login userInfo:`, userInfo);
    user.value = { ...userInfo }
    localStorage.setItem('auth_token', token)
    localStorage.removeItem('guest_id')

    socketStore.connect(token, undefined)
  }

  function logout() {
    console.info(`[AUTH] Logout ${JSON.stringify(user.value)}`);
    user.value = null
    localStorage.removeItem('auth_token')

    socketStore.socket?.disconnect()
  }

  async function tryAutoLogin() {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.warn('[AUTH] Auto login failed, token is nil')
      return false
    }
    
    try {
      const response = await getCurrentUser()
      const userInfo = response.data
      console.info(`[AUTH] Auto login success userInfo:`, userInfo)
      login(userInfo, token)
      return true
    } catch (error) {
      console.error(`[AUTH] Auto login failed error:`, error)
      logout()
      return false
    }
  }

  return {
    user,
    guestId,
    isLoggedIn,
    isGuest,
    proceedAsGuest,
    login,
    logout,
    tryAutoLogin
  }
}
