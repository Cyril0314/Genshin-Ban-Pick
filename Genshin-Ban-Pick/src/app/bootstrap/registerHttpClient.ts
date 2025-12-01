// src/app/bootstrap/registerHttpClient.ts

import { useAuthStore } from '@/modules/auth';
import { setTokenProvider } from '@/app/infrastructure/http/httpClient';

export function registerHttpClient(authStore: ReturnType<typeof useAuthStore>) {
    setTokenProvider(() => {
        const token = authStore.getToken();
        return token;
    });
    console.debug('[HTTP CLIENT] ✅ Token provider registered');
}
