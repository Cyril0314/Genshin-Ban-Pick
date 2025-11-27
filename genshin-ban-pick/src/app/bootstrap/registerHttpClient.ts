// src/app/bootstrap/registerHttpClient.ts

import { useAuthStore } from '@/modules/auth';
import { setTokenProvider } from '@/app/infrastructure/http/httpClient';

export function registerHttpClient() {``
    const authStore = useAuthStore();
    const token = authStore.getToken()
    setTokenProvider(() => token);
    console.debug('[SOCKET SYNC] ✅ Token registered', token);
}
