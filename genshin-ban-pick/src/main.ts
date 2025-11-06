// src/main.ts

import './assets/main.css';
import '@/assets/styles/semantic-colors.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import naive from 'naive-ui';

import App from './App.vue';
import router from './router';

import { useAuth } from '@/composables/useAuth';
import { useSocketStore } from './stores/socketStore';
import { useAuthStore } from './stores/authStore';

const app = createApp(App);
console.info('[MAIN] Create App');

app.use(createPinia());
app.use(router);
app.use(naive);

const auth = useAuth();
const authStore = useAuthStore();
const socketStore = useSocketStore();

await auth
    .tryAutoLogin()
    .then(({ identity, token }) => {
        console.info('[MAIN] Try auto login:', identity);
        socketStore.connect(token);
        app.mount('#app');
    })
    .catch((error) => {
        console.error('[MAIN] Redirect to /login');
        auth.logout();
        router.replace('/login');
        app.mount('#app');
    });

router.beforeEach((to, from, next) => {
    console.info(`[MAIN] Router before each to path ${to.path} from path ${from.path}`);
    const isLoggedIn = authStore.isLoggedIn;

    const publicPages = ['/login', '/register'];
    const isPublic = publicPages.includes(to.path);

    // 未認證又要進入受保護頁面 → 先斷線（若有），再導回 /login
    if (!isLoggedIn && !isPublic) {
        console.warn('[MAIN] Logout because user is not authenticated');
        auth.logout();
        socketStore.disconnect()
        return next({ path: '/login' });
    }

    // 進入公開頁面 → 先登出
    if (isPublic && isLoggedIn) {
        console.debug('[MAIN] Logout on public page');
        auth.logout();
        socketStore.disconnect()
    }

    next();
});
