// src/modules/board/store/matchStepStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';

import type { IMatchStep } from '../types/IMatchFlow';

export const useMatchStepStore = defineStore('matchStep', () => {
    const matchSteps = shallowRef<IMatchStep[]>([]);
    const stepIndex = ref<number>(0)
    const currentStep = computed(() => {
        const steps = matchSteps.value
        if (!steps) return null
        const index = stepIndex.value
        if (index >= steps.length) return null
        return steps[index]
    })

    watch(currentStep, (step) => {
        console.debug('[BP STEP STORE] Watch current step', step)
    }, { immediate: true })

    function initMatchSteps(newSteps: IMatchStep[]) {
        console.debug('[BP STEP STORE] Init ban pick steps', newSteps)
        matchSteps.value = newSteps
    }

    function setStepIndex(index: number) {
        console.debug('[BP STEP STORE] Set step index', index)
        stepIndex.value = index
    }

    return { matchSteps, currentStep, initMatchSteps, setStepIndex };
});
