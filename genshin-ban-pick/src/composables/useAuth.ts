// src/composables/useAuth.ts
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser } from '@/network/authService'

interface UserInfo {
  id: string
  account: string
  nickname: string
}
const user = ref<UserInfo | null>(null)

export function useAuth() {
  const router = useRouter()

  const isLoggedIn = computed(() => !!user.value)
  const isGuest = computed(() => !user.value)

  function login(userInfo: UserInfo, token: string) {
    user.value = { ...userInfo }
    localStorage.setItem('auth_token', token)
  }

  function logout() {
    user.value = null
    localStorage.removeItem('auth_token')
    router.push('/login')
  }

  async function tryAutoLogin() {
    const token = localStorage.getItem('auth_token')
    console.log(`auto login token: ${token}`)
    if (!token) return

    try {
      const response = await getCurrentUser()
      const userInfo = response.data
      login(userInfo, token)
    } catch (e) {
      console.warn('自動登入失敗', e)
      logout()
    }
  }

  return {
    user,
    isLoggedIn,
    isGuest,
    login,
    logout,
    tryAutoLogin
  }
}
