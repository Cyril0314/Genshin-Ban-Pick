<!-- src/modules/player/ui/components/PlayerCharacterFrequencyList.vue -->
<!-- 玩家角色使用次數清單：頭像 + 名稱 + 次數/比率 + 比率長條。
     角色 hover 透過 CharacterHoverWrapper 注入（反依賴），本模組不直接相依 analysis；
     無 provider 時降級為 Passthrough（純顯示、無 hover）。 -->

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import type { IPlayerCharacterFrequency } from '@/modules/player/domain/computePlayerCharacterFrequency';
import type { Element } from '@shared/contracts/character/value-types';

import { useCharacterStore } from '@/modules/character';
import { getProfileImagePath } from '@/modules/shared/infrastructure/imageRegistry';
import { useCharacterDisplayName } from '@/modules/shared/ui/composables/useCharacterDisplayName';
import { elementColors } from '@/modules/shared/ui/constants/elementColors';
import { useCharacterHoverWrapper } from '@/modules/shared/ui/context/characterHoverWrapperContext';

const props = defineProps<{
    frequency: IPlayerCharacterFrequency[];
}>();

const CharacterHoverWrapper = useCharacterHoverWrapper();

const { characterMap } = storeToRefs(useCharacterStore());
const { getByKey: getCharacterDisplayName } = useCharacterDisplayName();

// bar 寬度分母：Top 1 的 count
const maxCount = computed(() => props.frequency[0]?.count ?? 0);
function getBarWidth(count: number): string {
    if (maxCount.value <= 0) return '0%';
    return `${(count / maxCount.value) * 100}%`;
}

// 角色 → element → 主題色，作為 row 左側 accent；找不到 element 用中性灰
function getRowStyle(characterKey: string) {
    const element = characterMap.value[characterKey]?.element as Element | undefined;
    return { '--row-accent': element ? elementColors[element].main : '#555555' };
}
</script>

<template>
    <ol class="frequency-list">
        <li v-for="f in frequency" :key="f.characterKey" class="frequency-row" :style="getRowStyle(f.characterKey)">
            <component :is="CharacterHoverWrapper" :character-key="f.characterKey">
                <img class="avatar" :src="getProfileImagePath(f.characterKey)" :alt="getCharacterDisplayName(f.characterKey)" />
            </component>
            <div class="frequency-content">
                <div class="frequency-head">
                    <span class="frequency-name">{{ getCharacterDisplayName(f.characterKey) }}</span>
                    <span class="frequency-stats">
                        <span class="count">{{ f.count }} 次</span>
                        <span class="rate">{{ (f.rate * 100).toFixed(0) }}%</span>
                    </span>
                </div>
                <div class="rate-bar">
                    <div class="rate-fill" :style="{ width: getBarWidth(f.count) }" />
                </div>
            </div>
        </li>
    </ol>
</template>

<style scoped>
.frequency-list {
    --size-avatar: calc(var(--base-size) * 3);

    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0;
    list-style: none;
    scrollbar-width: none;
}

.frequency-row {
    display: flex;
    align-items: flex-start;
    gap: var(--space-md);
    padding: var(--space-md) var(--space-sm);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    background: linear-gradient(to right, color-mix(in srgb, var(--row-accent, transparent) 14%, transparent) 0%, transparent 70%);
    transition: background-color 0.18s ease;
}

.frequency-row:last-child {
    border-bottom: none;
}

.frequency-row:hover {
    background:
        linear-gradient(to right, color-mix(in srgb, var(--row-accent, transparent) 14%, transparent) 0%, transparent 70%),
        var(--md-sys-color-surface-container-low);
}

.avatar {
    width: var(--size-avatar);
    height: var(--size-avatar);
    border-radius: 50%;
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
    flex-shrink: 0;
}

.frequency-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    flex: 1;
    min-width: 0;
}

.frequency-head {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.frequency-name {
    flex: 1;
    font-weight: var(--font-weight-medium);
}

.frequency-stats {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-shrink: 0;
    font-size: var(--font-size-sm);
}

.count {
    color: var(--md-sys-color-on-surface-variant);
}

.rate {
    font-weight: var(--font-weight-bold);
}

.rate-bar {
    width: 100%;
    height: 3px;
    background: var(--md-sys-color-outline-variant);
    border-radius: 999px;
    overflow: hidden;
}

.rate-fill {
    height: 100%;
    background: var(--row-accent, var(--md-sys-color-primary));
    border-radius: inherit;
    transition: width 0.35s ease;
}
</style>
