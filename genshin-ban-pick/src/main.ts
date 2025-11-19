// src/main.ts

import './assets/main.css';
import '@/assets/styles/semantic-colors.css';
import '@/assets/styles/alpha.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import naive from 'naive-ui';

import App from './App.vue';
import router from './router';

import { useAuthDomain } from '@/composables/useAuthDomain';
import { useSocketStore } from './stores/socketStore';
import { useAuthStore } from './stores/authStore';

const app = createApp(App);
console.info('[MAIN] Create App');

app.use(createPinia());
app.use(router);
app.use(naive);

const authDomain = useAuthDomain();
const authStore = useAuthStore();
const socketStore = useSocketStore();

await authDomain
    .tryAutoLogin()
    .then(({ identity, token }) => {
        console.info('[MAIN] Try auto login:', identity);
        socketStore.connect(token);
    })
    .catch(() => {
        console.info('[MAIN] Auto login failed');
        authDomain.logout();
        socketStore.disconnect();
    })
    .finally(() => {
        app.mount('#app');
    });

router.beforeEach((to, from, next) => {
    console.info(`[MAIN] Route → ${from.path} → ${to.path}`);

    const isLoggedIn = authStore.isLoggedIn;

    // 定義「所有公開頁面」
    const publicPages = ['/login', '/register', '/room-setting'];

    // ❗ 用 startsWith 避免 query / 動態 segment 出問題
    const isPublic = publicPages.some((path) => to.path.startsWith(path));
    console.info('[GUARD]', {
        to: to.path,
        isLoggedIn,
        isPublic,
    });
    // ------------ Case 1: 未登入且不是公開頁（需要保護） -----------------
    if (!isLoggedIn && !isPublic) {
        console.warn('[MAIN] Not logged in → redirect to /login');
        authDomain.logout();
        socketStore.disconnect();
        return next('/login');
    }

    // ------------ Case 2: 已登入但前往 login/register 時 --------------
    if (isLoggedIn && (to.path === '/login' || to.path === '/register')) {
        console.info('[MAIN] Already logged in → redirect to home or last page');
        return next('/room-list');
    }

    // ------------ Case 3: 已登入且 socket 未連 → 自動連線 --------------
    if (isLoggedIn && !socketStore.connected) {
        console.info('[MAIN] Auto reconnect socket');
        socketStore.connect(authStore.getToken()!);
    }

    return next();
});
