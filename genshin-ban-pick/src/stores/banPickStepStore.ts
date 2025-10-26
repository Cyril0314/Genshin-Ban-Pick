// src/stores/banPickStepStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';

import type { IBanPickStep } from '@/types/IBanPickStep';

export const useBanPickStepStore = defineStore('banPickStep', () => {
    const banPickSteps = shallowRef<IBanPickStep[]>([]);
    const stepIndex = ref<number>(0)
    const currentStep = computed(() => {
        const steps = banPickSteps.value
        if (!steps) return null
        const index = stepIndex.value
        if (index >= steps.length) return null
        return steps[index]
    })

    watch(currentStep, (step) => {
        console.debug('[BP STEP STORE] Watch current step', step)
    }, { immediate: true })

    function initBanPickSteps(newSteps: IBanPickStep[]) {
        console.debug('[BP STEP STORE] Init ban pick steps', newSteps)
        banPickSteps.value = newSteps
    }

    function setStepIndex(index: number) {
        console.debug('[BP STEP STORE] Set step index', index)
        stepIndex.value = index
    }

    return { banPickSteps, currentStep, initBanPickSteps, setStepIndex };
});
