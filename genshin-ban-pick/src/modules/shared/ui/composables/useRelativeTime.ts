// src/composables/useRelativeTime.ts
import { ref, computed, onUnmounted } from 'vue';

export function useRelativeTime(timestamp: string | number | Date) {
    const now = ref(Date.now());

    const timer = setInterval(() => {
        now.value = Date.now();
    }, 1000);

    onUnmounted(() => clearInterval(timer));

    const formatted = computed(() => {
        const time = new Date(timestamp).getTime();
        const diffSec = Math.floor((now.value - time) / 1000);

        if (diffSec < 60) {
            return `${diffSec} 秒前`;
        }
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) {
            return `${diffMin} 分鐘前`;
        }
        const diffHour = Math.floor(diffMin / 60);
        if (diffHour < 24) {
            return `${diffHour} 小時前`;
        }

        // 超過 1 天用日期格式
        const d = new Date(time);
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const DD = String(d.getDate()).padStart(2, '0');
        const HH = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');

        return `${MM}-${DD} ${HH}:${mm}`;
    });

    return formatted;
}
