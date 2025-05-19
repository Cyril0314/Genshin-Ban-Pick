import './assets/main.css'
import '@/assets/styles/semantic-colors.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const guestId = localStorage.getItem('guest_id')

  const isAuthenticated = !!token || !!guestId

  if (!isAuthenticated && to.path !== '/login') {
    // 若尚未選身份就導回首頁
    return next({ path: '/login' })
  }

  next() // 放行
})
