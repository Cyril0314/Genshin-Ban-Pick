// src/main.ts

import './assets/main.css'
import '@/assets/styles/semantic-colors.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import { useAuth } from '@/composables/useAuth'
import { useSocketStore } from '@/network/socket'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const socketStore = useSocketStore()
const auth = useAuth()

auth.tryAutoLogin().then(success => {
  console.log('[Main] tryAutoLogin result:', success)

  if (!success) {
    console.log('[Main] redirect to /login')
    router.replace('/login')
  }

  app.mount('#app')
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const guestId = localStorage.getItem('guest_id')
  const isAuth = !!token || !!guestId

  const publicPages = ['/login', '/register']
  const isPublic = publicPages.includes(to.path)

  // 未認證又要進入受保護頁面 → 先斷線（若有），再導回 /login
  if (!isAuth && !isPublic) {
    console.log('[Router] disconnect because user is not authenticated')
    auth.logout()
    return next({ path: '/login' })
  }

  // 進入公開頁面 → 如果已 connect，先 disconnect，再放行
  if (isPublic && socketStore.socket?.connected) {
    console.log('[Router] logout on public page')
    auth.logout()
  }

  next()
})
