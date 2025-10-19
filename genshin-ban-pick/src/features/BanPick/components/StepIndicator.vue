<!-- src/features/BanPick/components/StepIndicator.vue -->
<script setup lang="ts">

import { storeToRefs, } from 'pinia';
import { ref, computed, watch } from 'vue'

import { useTeamTheme } from '@/composables/useTeamTheme';
import { useBanPickStepStore } from '@/stores/banPickStepStore';

const active = ref(false)
const banPickStepStore = useBanPickStepStore()
const { currentStep } = storeToRefs(banPickStepStore)

const currentTeam = computed(() => {
  return currentStep.value?.team
})

const displayText = computed(() => {
  console.log(`localStep ${JSON.stringify(currentStep.value)}`);
  if (!currentStep.value) return '選角結束'
  const input = `${currentStep.value.zoneId}`
  const output = input
    .replace(/^zone-ban-(\d+)$/, 'Ban $1')
    .replace(/^zone-pick-(\d+)$/, 'Pick $1')
    .replace(/^zone-utility-(\d+)$/, 'Utility $1')

  return `輪到 ${currentTeam.value?.name}\n選擇 ${output} 角色`
})

watch(currentTeam, () => {
  active.value = true
  setTimeout(() => (active.value = false), 1200)
})

</script>

<template>
  <div class="step-indicator" :class="{ active }"
    :style="useTeamTheme(currentTeam?.id ?? 0).themeVars.value">
    {{ displayText }}
  </div>
</template>

<style scoped>
.step-indicator {
  background-color: var(--md-sys-color-surface-container-highest-alpha);
  color: var(--md-sys-color-on-surface);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-tech-title);
  text-align: center;
  width: var(--size-step-indicator);
  padding: var(--space-sm) var(--space-xs);
  border-radius: var(--border-radius-xs);
  backdrop-filter: var(--backdrop-filter);
  white-space: pre-line;
  transition: all 0.3s ease;
  animation: steadyGlow 2s ease-in-out infinite alternate;
}

/* 預設沒有光 */
.step-indicator {
  box-shadow: none;
}

.step-indicator.active {
  animation: indicatorPulse 1.2s ease-in-out 1, steadyGlow 2s ease-in-out infinite alternate;
}

@keyframes indicatorPulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 0.95;
  }
}

@keyframes steadyGlow {
  0% {
    box-shadow: 0 0 8px 2px var(--team-bg);
  }

  100% {
    box-shadow: 0 0 12px 4px var(--team-bg);
  }
}
</style>
