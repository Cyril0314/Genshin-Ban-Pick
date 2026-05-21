// src/app/bootstrap/useAppInitializer.ts

import { onMounted, ref } from 'vue';

import { useSocketStore } from '@/app/stores/socketStore';
import { useAuthUseCase } from '@/modules/auth';
import { useAuthStore } from '@/modules/auth/store/authStore';

export function useAppInitializer() {
    const isInitializing = ref(true);
    const authUseCase = useAuthUseCase();
    const authStore = useAuthStore();
    const socketStore = useSocketStore();

    onMounted(async () => {
        try {
            await authUseCase.autoLogin();
            const token = authStore.getToken();
            if (token) {
                socketStore.connect(token);
            }
        } finally {
            isInitializing.value = false;
        }
    });

    return { isInitializing };
}
