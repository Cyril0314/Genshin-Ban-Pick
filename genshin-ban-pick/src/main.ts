import './assets/main.css'
import '@/assets/styles/semantic-colors.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { provideSocket } from './network/SocketProvider'
import { useAuth } from '@/composables/useAuth'

const auth = useAuth()
auth.loadFromStorage()

const app = createApp(App)
provideSocket(app)

app.use(createPinia())
app.use(router)

app.mount('#app')
