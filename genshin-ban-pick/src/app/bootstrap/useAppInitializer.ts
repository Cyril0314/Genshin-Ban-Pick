// src/app/bootstrap/useAppInitializer.ts

import { onMounted, ref } from 'vue';

import { useSocketStore } from '@/app/stores/socketStore';
import { authUseCase } from '@/modules/auth';

export function useAppInitializer() {
    const isInitializing = ref(true);
    const { autoLogin } = authUseCase();
    const socketStore = useSocketStore();

    onMounted(async () => {
        try {
            const result = await autoLogin();
            if (result?.token) {
                socketStore.connect(result.token);
            }
        } finally {
            isInitializing.value = false;
        }
    });

    return { isInitializing };
}
