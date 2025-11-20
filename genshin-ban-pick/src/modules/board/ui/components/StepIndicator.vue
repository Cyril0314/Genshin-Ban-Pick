<!-- src/features/StepIndicator/StepIndicator.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, computed, watch } from 'vue';

import { useTeamTheme } from '@/composables/useTeamTheme';
import { useBoardImageStore } from '@/modules/board/store/boardImageStore';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useMatchStepStore } from '@/modules/board/store/matchStepStore';
import { ZoneType } from '@/modules/board/types/IZone';

const active = ref(false);
const matchStepStore = useMatchStepStore();
const { currentStep } = storeToRefs(matchStepStore);
const boardImageStore = useBoardImageStore();
const { zoneMetaTable } = storeToRefs(boardImageStore);
const teamInfoStore = useTeamInfoStore();
const { teams } = storeToRefs(teamInfoStore);

const currentTeam = computed(() => {
    return teams.value.find((team) => team.slot === currentStep.value?.teamSlot);
});

const currentTeamTheme = computed(() => {
    if (!currentTeam.value) {
        return null
    }
    return useTeamTheme(currentTeam.value.slot).themeVars.value;
});

const teamColorRGB = computed(() => {
    if (currentTeamTheme.value === null) {
        return 'var(--md-sys-color-on-surface-rgb)';
    }
    return currentTeamTheme.value['--team-color-rgb'];
});

const displayText = computed(() => {
    if (!currentStep.value) return '選角結束';
    const currentZone = zoneMetaTable.value[currentStep.value.zoneId];
    let currentZoneName: string;
    switch (currentZone.type) {
        case ZoneType.Ban:
            currentZoneName = `Ban ${currentZone.order + 1}`;
            break;
        case ZoneType.Pick:
            currentZoneName = `Pick ${currentZone.order + 1}`;
            break;
        case ZoneType.Utility:
            currentZoneName = `Utility ${currentZone.order + 1}`;
            break;
    }
    if (currentTeam.value) {
        return `輪到 ${currentTeam.value.name}\n選擇 ${currentZoneName} 角色`;
    } else {
        return `選擇 ${currentZoneName} 角色`;
    }
});

watch(currentTeam, () => {
    active.value = true;
});
</script>

<template>
    <div class="step-indicator" :class="{ active }" :style="{ '--team-color-rgb': teamColorRGB, }"
        @animationend="active = false">
        <span class="step-label">{{ displayText }}</span>
    </div>
</template>

<style scoped>
.step-indicator {
    display: flex;
    align-items: center;
    width: var(--size-step-indicator);
    height: 100%;
    border-radius: var(--radius-md);
    background-color: var(--md-sys-color-surface-container-highest);
    white-space: pre-line;
    transition: all 0.3s ease;
    
    box-shadow:
        0 0 8px rgba(var(--team-color-rgb) / 0.8),
        0 0 16px rgba(var(--team-color-rgb) / 0.32),
        0 0 32px rgba(var(--team-color-rgb) / 0.16);

    outline: 2px solid rgba(var(--team-color-rgb) / 0.55);
    animation: zonePulse 1.6s ease-in-out infinite;
}

@keyframes zonePulse {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.35);
  }
  100% {
    filter: brightness(1);
  }
}

.step-indicator::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;

    pointer-events: none;

    opacity: 0;
}

.step-indicator.active::after {
    animation: indicatorPulse 0.9s ease-out;
}

.step-label {
    width: 100%;
    text-align: center;
    line-height: 1.3;
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    font-family: var(--font-family-tech-title);

}
</style>
