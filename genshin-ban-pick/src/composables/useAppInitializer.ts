// src/composables/useAppInitializer.ts
import { onMounted, ref } from 'vue';

import { useSocketStore } from '@/stores/socketStore';
import { useAuthUseCase } from '@/modules/auth';

export function useAppInitializer() {
    const isInitializing = ref(true);
    const authUseCase = useAuthUseCase();
    const socketStore = useSocketStore();

    onMounted(async () => {
        try {
            const result = await authUseCase.autoLogin();
            if (result?.token) {
                socketStore.connect(result.token);
            }
        } finally {
            isInitializing.value = false;
        }
    });

    return { isInitializing };
}
