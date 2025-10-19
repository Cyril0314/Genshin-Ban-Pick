// src/stores/banPickStepStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

import type { IBanPickStep } from '@/types/IBanPickStep';

export const useBanPickStepStore = defineStore('banPickStep', () => {
    const banPickSteps = ref<IBanPickStep[]>([]);
    const stepIndex = ref<number>(0)
    const currentStep = computed(() => {
        const steps = banPickSteps.value
        if (!steps) return null
        const index = stepIndex.value
        if (index >= steps.length) return null
        return steps[index]
    })

    watch(currentStep, (step) => {
        if (step) {
            console.log('[INIT] step ready', step)
            // ✅ 可在這裡做後續動作
        } else {
            console.log('[INIT] step is null')
        }
    }, { immediate: true })

    function initBanPickSteps(steps: IBanPickStep[]) {
        banPickSteps.value = steps
    }

    function setStepIndex(index: number) {
        stepIndex.value = index
    }

    function isCurrentStepZone(zoneId: string) {
        console.log(`isCurrentStepZone: currentStep.value?.zoneId ${currentStep.value?.zoneId}`)
        return zoneId === currentStep.value?.zoneId
    }

    return { banPickSteps, currentStep, initBanPickSteps, setStepIndex, isCurrentStepZone };
});
