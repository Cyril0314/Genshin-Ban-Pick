// src/app/ui/composables/useViewportScale.vue

import { onMounted, onUnmounted } from 'vue';

import { createLogger } from '@/app/utils/logger';

const logger = createLogger('banPick.ui.viewport');

export function useViewportScale(options?: { width?: number; height?: number }) {
    const W = options?.width ?? 1650;
    const H = options?.height ?? 1000;

    function adjustScale() {
        const wrapper = document.querySelector('.viewport-wrapper');
        if (!wrapper) return;

        const content = wrapper.querySelector('.viewport-content') as HTMLElement;
        if (!content) return;

        document.documentElement.style.setProperty('--layout-width', `${W}px`);
        document.documentElement.style.setProperty('--layout-height', `${H}px`);

        const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
        content.style.transform = `scale(${scale})`;
    }

    onMounted(() => {
        logger.debug('mounted');
        adjustScale();
        window.addEventListener('resize', adjustScale);
    });

    onUnmounted(() => {
        logger.debug('unmounted');
        window.removeEventListener('resize', adjustScale);
    });

    return {
        adjustScale, // 如需手動重算仍能調用
    };
}
