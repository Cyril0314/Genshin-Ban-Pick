// src/composables/useScopedCssVar.ts
import { onMounted, ref, getCurrentInstance, watch } from 'vue';
import { useCssVar } from '@vueuse/core';

export function useScopedCssVar(varName: string, selector: string = '.scale-context') {
    const targetEl = ref<HTMLElement | null>(null);
    const cssVar = ref('');

    function resolveCalc(value: string) {
        if (!value || !value.includes('calc')) return value;
        const temp = document.createElement('div');
        temp.style.width = value;
        document.body.appendChild(temp);
        const result = getComputedStyle(temp).width;
        document.body.removeChild(temp);
        return result;
    }

    onMounted(() => {
        const instance = getCurrentInstance();
        const rawNode = (instance?.proxy as any)?.$el ?? instance?.vnode?.el ?? null;

        // 取得一個 HTMLElement 作為起點
        let start: HTMLElement | null = null;
        if (rawNode instanceof HTMLElement) {
            start = rawNode;
        } else if (rawNode && (rawNode as any).parentElement instanceof HTMLElement) {
            start = (rawNode as any).parentElement;
        } else if (rawNode && (rawNode as any).parentNode instanceof HTMLElement) {
            start = (rawNode as any).parentNode as HTMLElement;
        }

        // 嘗試就近尋找 .scale-context
        let scoped: HTMLElement | null =
            (start && typeof (start as any).closest === 'function' ? (start as any).closest(selector) : null) ||
            (document.querySelector(selector) as HTMLElement | null) ||
            document.documentElement;

        targetEl.value = scoped;

        // 💡 綁定該範圍的 CSS 變數
        const varRef = useCssVar(varName, targetEl);
        if (varRef.value) {
            cssVar.value = varRef.value;
            watch(varRef, (v) => (cssVar.value = resolveCalc(v ?? '')), { immediate: true });
        }
    });

    return { cssVar, targetEl };
}
