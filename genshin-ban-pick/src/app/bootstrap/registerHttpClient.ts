// src/app/bootstrap/registerHttpClient.ts

import { useAuthStore } from '@/modules/auth';
import { setTokenProvider } from '@/app/infrastructure/http/httpClient';

export function registerHttpClient() {
    const authStore = useAuthStore();
    setTokenProvider(() => authStore.getToken());
    console.debug('[SOCKET SYNC] ✅ Token registered');
}
