// src/composables/useAuth.ts
import { ref, computed } from 'vue'

import { getCurrentUser } from '@/network/authService'
import { useSocketStore } from '@/network/socket'

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
    console.log(`proceedAsGuest ${guestId.value}`);
    if (!guestId.value) {
      guestId.value = `guest_${Math.random().toString(36).slice(2, 8)}`
      localStorage.setItem('guest_id', guestId.value)
      localStorage.removeItem('auth_token')
    }

    socketStore.connect(undefined, guestId.value)
  }

  function login(userInfo: UserInfo, token: string) {
    console.log(`login user ${userInfo}`);
    user.value = { ...userInfo }
    localStorage.setItem('auth_token', token)
    localStorage.removeItem('guest_id')

    socketStore.connect(token, undefined)
  }

  function logout() {
    console.log(`logout user ${user.value}`);
    user.value = null
    guestId.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('guest_id')

    socketStore.socket?.disconnect()
  }

  async function tryAutoLogin() {
    const token = localStorage.getItem('auth_token')
    console.log(`auto login token: ${token}`)
    if (!token) {
      console.warn('自動登入失敗 token 不存在')
      return false
    }
    
    try {
      const response = await getCurrentUser()
      const userInfo = response.data
      console.log('自動登入', response)
      login(userInfo, token)
      return true
    } catch (e) {
      console.warn('自動登入失敗', e)
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
