<!-- src/features/BanPick/components/StepIndicator.vue -->
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, computed, watch } from 'vue';

import { useTeamTheme } from '@/composables/useTeamTheme';
import { useBoardImageStore } from '@/stores/boardImageStore';
import { useTeamInfoStore } from '@/stores/teamInfoStore';
import { useBanPickStepStore } from '@/stores/banPickStepStore';
import { ZoneType } from '@/types/IZone';

const active = ref(false);
const banPickStepStore = useBanPickStepStore();
const { currentStep } = storeToRefs(banPickStepStore);
const boardImageStore = useBoardImageStore();
const { zoneMetaTable } = storeToRefs(boardImageStore);
const teamInfoStore = useTeamInfoStore();
const { teams } = storeToRefs(teamInfoStore);

const currentTeam = computed(() => {
    return teams.value.find((team) => team.id === currentStep.value?.teamId);
});

const displayText = computed(() => {
    if (!currentStep.value || !currentTeam.value) return '選角結束';
    const currentZone = zoneMetaTable.value[currentStep.value.zoneId];
    let currentZoneName: string;
    switch (currentZone.type) {
        case ZoneType.BAN:
            currentZoneName = `Ban ${currentZone.order + 1}`;
            break;
        case ZoneType.PICK:
            currentZoneName = `Pick ${currentZone.order + 1}`;
            break;
        case ZoneType.UTILITY:
            currentZoneName = `Utility ${currentZone.order + 1}`;
            break;
    }
    return `輪到 ${currentTeam.value.name}\n選擇 ${currentZoneName} 角色`;
});

watch(currentTeam, () => {
    active.value = true;
});
</script>

<template>
    <div class="step-indicator" :class="{ active }" :style="useTeamTheme(currentTeam?.id ?? 0).themeVars.value" @animationend="active = false">
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
    animation:
        indicatorPulse 1.2s ease-in-out 1,
        steadyGlow 2s ease-in-out infinite alternate;
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
        box-shadow: 0 0 4px 1px var(--team-bg, rgba(255, 255, 255, 0.3));
    }
    50% {
        box-shadow: 0 0 10px 3px var(--team-bg, rgba(255, 255, 255, 0.5));
    }
    100% {
        box-shadow: 0 0 6px 2px var(--team-bg, rgba(255, 255, 255, 0.4));
    }
}
</style>
