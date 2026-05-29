// src/app/bootstrap/registerHttpClient.ts

import { useAuthStore } from '@/modules/auth';
import { setTokenProvider } from '@/app/infrastructure/http/httpClient';
import { createLogger } from '@/app/utils/logger';

const logger = createLogger('app.bootstrap.httpClient');

export function registerHttpClient(authStore: ReturnType<typeof useAuthStore>) {
    setTokenProvider(() => {
        const token = authStore.getToken();
        return token;
    });
    logger.debug('token provider registered');
}
