// src/main.ts

import './assets/main.css';
import '@/assets/styles/semantic-colors.css';

import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

import { useAuth } from '@/composables/useAuth';

const app = createApp(App);
console.info('[MAIN] Create App');

app.use(createPinia());
app.use(router);

const auth = useAuth();

auth.tryAutoLogin().then((success) => {
    console.info('[MAIN] Try auto login result:', success);

    if (!success) {
        console.info('[MAIN] Redirect to /login');
        router.replace('/login');
    }

    app.mount('#app');
});

router.beforeEach((to, from, next) => {
    console.info(`[MAIN] Router before each to path ${to.path} from path ${from.path}`);
    const token = localStorage.getItem('auth_token');
    const guestId = localStorage.getItem('guest_id');
    const isAuth = !!token || !!guestId;

    const publicPages = ['/login', '/register'];
    const isPublic = publicPages.includes(to.path);

    // 未認證又要進入受保護頁面 → 先斷線（若有），再導回 /login
    if (!isAuth && !isPublic) {
        console.warn('[MAIN] Logout because user is not authenticated');
        auth.logout();
        return next({ path: '/login' });
    }

    // 進入公開頁面 → 先登出
    if (isPublic && isAuth) {
        console.debug('[MAIN] Logout on public page');
        auth.logout();
    }

    next();
});
