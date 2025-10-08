import './assets/main.css'
import '@/assets/styles/semantic-colors.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useSocketStore } from '@/network/socket'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
const socketStore = useSocketStore()

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const guestId = localStorage.getItem('guest_id')
  const isAuth = !!token || !!guestId

  const publicPages = ['/login', '/register']
  const isPublic = publicPages.includes(to.path)

  // 1. 未認證又要進入受保護頁面 → 先斷線（若有），再導回 /login
  if (!isAuth && !isPublic) {
    console.log('[Router] disconnect because user is not authenticated')
    socketStore.socket?.disconnect()
    return next({ path: '/login' })
  }

  // 2. 已認證進入受保護頁面（除了 login） → 如果還沒 connect，就立刻 connect
  if (isAuth && !isPublic) {
    if (!socketStore.socket?.connected) {
      console.log('[Router] ensure socket connected for protected page')
      socketStore.connect(token ?? undefined, guestId ?? undefined)
      socketStore.socket!.once('connect', () => {
        next()
      })
      return
    }
  }

  // 3. 進入公開頁面 → 如果已 connect，先 disconnect，再放行
  if (isPublic && socketStore.socket?.connected) {
    console.log('[Router] disconnect on public page')
    socketStore.socket.disconnect()
  }

  next()
})
