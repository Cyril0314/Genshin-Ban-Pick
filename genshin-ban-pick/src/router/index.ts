// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

import BanPickView from '@/views/banPick/BanPickView.vue';
import LoginView from '@/modules/auth/ui/views/LoginView.vue';
import RegisterView from '@/modules/auth/ui/views/RegisterView.vue';
import RoomSettingView from '@/modules/room/ui/views/RoomSettingView.vue';
import RoomListView from '@/modules/room/ui/views/RoomListView.vue';
import PlayerProfileView from '@/views/playerProfile/PlayerProfileView.vue';

import { useAuthStore } from '@/modules/auth';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: LoginView,
            meta: { public: true },
        },
        {
            path: '/register',
            name: 'Register',
            component: RegisterView,
            meta: { public: true },
        },
        {
            path: '/room-setting',
            name: 'RoomSetting',
            component: RoomSettingView,
            meta: { requiresAuth: true },
        },
        {
            path: '/room-list',
            name: 'RoomList',
            component: RoomListView,
            meta: { requiresAuth: true },
        },
        {
            path: '/ban-pick',
            name: 'BanPick',
            component: BanPickView,
            meta: { requiresAuth: true },
        },
        {
            path: '/player-profile',
            name: 'PlayerProfile',
            component: PlayerProfileView,
            meta: { requiresAuth: true },
        },
    ],
});

router.beforeEach((to, from, next) => {
    const auth = useAuthStore();

    if (to.meta.requiresAuth && !auth.isLoggedIn) {
        return next('/login');
    }

    next();
});

export default router;
