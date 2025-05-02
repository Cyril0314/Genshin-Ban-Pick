// src/composables/useAuth.ts
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

interface User {
  id: string
  account: string
  nickname: string
  token: string
}

const user = ref<User | null>(null)

export function useAuth() {
  const router = useRouter()

  const isLoggedIn = computed(() => !!user.value)
  const isGuest = computed(() => !user.value)

  function login(userData: User) {
    user.value = userData
    localStorage.setItem('auth', JSON.stringify(userData))
  }

  function logout() {
    user.value = null
    localStorage.removeItem('auth')
    router.push('/login')
  }

  function loadFromStorage() {
    const raw = localStorage.getItem('auth')
    if (raw) {
      try {
        user.value = JSON.parse(raw)
      } catch (e) {
        console.error('auth load failed', e)
        user.value = null
      }
    }
  }

  return {
    user,
    isLoggedIn,
    isGuest,
    login,
    logout,
    loadFromStorage,
  }
}
