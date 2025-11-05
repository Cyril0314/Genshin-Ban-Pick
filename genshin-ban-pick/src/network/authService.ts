import axios from 'axios';

import { TokenNotFound } from '@/errors/AppError';
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true, // 如果後端需要帶 cookie
});

api.interceptors.request.use((config) => {
    const withToken = config.withToken ?? true;
    if (withToken) {
        const token = useAuthStore().getToken();
        if (token && config.headers?.set) {
            config.headers?.set?.('Authorization', `Bearer ${token}`);
        } else {
            throw new TokenNotFound();
        }
    }
    return config;
});

declare module 'axios' {
    export interface AxiosRequestConfig {
        withToken?: boolean;
    }
}

export default api;

export async function registerMember(payload: { account: string; password: string; nickname: string }) {
    return api.post('/auth/register/member', payload, { withToken: false });
}

export async function loginMember(payload: { account: string; password: string }) {
    return api.post('/auth/login/member', payload, { withToken: false });
}

export async function loginGuest(payload: { nickname: string }) {
    return api.post('/auth/login/guest', payload, { withToken: false });
}

export async function getAuthSession() {
    return api.get('/auth/session');
}
