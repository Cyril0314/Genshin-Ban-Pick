<!-- src/modules/analysis/ui/components/CharacterHoverCard.vue -->

<script setup lang="ts">
import { getProfileImagePath } from '@/modules/shared/infrastructure/imageRegistry';
import {
    elementTranslator,
    weaponTranslator,
    regionTranslator,
    roleTranslator,
    rarityTranslator,
} from '@/modules/shared/ui/composables/useCharacterTranslators';
import { useCharacterHoverCard } from '../composables/useCharacterHoverCard';

const props = defineProps<{
    characterKey: string;
    disabled?: boolean;
}>();

const {
    load,
    character,
    displayName,
    elementColor,
    usage,
    totalAppearances,
    pickPriorityText,
    topSynergies,
    isInitialized,
} = useCharacterHoverCard(() => props.characterKey);

function handleShowChange(show: boolean) {
    if (show) load();
}
</script>

<template>
    <n-popover trigger="hover" placement="right" :delay="600" :keep-alive-on-hover="true" raw
        to="body" :z-index="6000" :disabled="disabled" class="character-hover-card-popover"
        @update:show="handleShowChange">
        <template #trigger>
            <slot />
        </template>

        <div v-if="character" class="character-hover-card scale-context" :style="{ '--element-color': elementColor }">
            <header class="header">
                <img class="portrait" :src="getProfileImagePath(characterKey)" :alt="displayName" />
                <div class="title">
                    <span class="name">{{ displayName }}</span>
                    <span class="rarity">{{ rarityTranslator(character.rarity) }}</span>
                </div>
                <div class="priority">
                    <span class="priority-value">{{ pickPriorityText }}</span>
                    <span class="priority-label">搶角 PR</span>
                </div>
            </header>

            <dl class="attributes">
                <div class="attribute">
                    <dt>屬性</dt>
                    <dd class="is-element">{{ elementTranslator(character.element) }}</dd>
                </div>
                <div class="attribute">
                    <dt>武器</dt>
                    <dd>{{ weaponTranslator(character.weapon) }}</dd>
                </div>
                <div class="attribute">
                    <dt>地區</dt>
                    <dd>{{ regionTranslator(character.region) }}</dd>
                </div>
                <div class="attribute">
                    <dt>定位</dt>
                    <dd>{{ roleTranslator(character.role) }}</dd>
                </div>
            </dl>

            <div v-if="usage" class="usage">
                <dl class="usage-grid">
                    <div class="usage-row"><dt>權重</dt><dd>{{ usage.effectiveUsage.toFixed(2) }}</dd></div>
                    <div class="usage-row"><dt>總登場/有效場次</dt><dd>{{ totalAppearances }} / {{ usage.validMatchCount }}</dd></div>
                </dl>

                <div class="usage-section">
                    <div class="usage-header">
                        <span class="usage-title">Pick 選取</span>
                        <span class="usage-total">{{ usage.context.pick.total }}</span>
                    </div>
                    <dl class="usage-grid">
                        <div class="usage-row"><dt>手動·上場</dt><dd>{{ usage.context.pick.manualUsed }}</dd></div>
                        <div class="usage-row"><dt>隨機·上場</dt><dd>{{ usage.context.pick.randomUsed }}</dd></div>
                        <div class="usage-row"><dt>手動·換自由位</dt><dd>{{ usage.context.pick.manualNotUsed }}</dd></div>
                        <div class="usage-row"><dt>隨機·換自由位</dt><dd>{{ usage.context.pick.randomNotUsed }}</dd></div>
                    </dl>
                </div>

                <div class="usage-section">
                    <div class="usage-header">
                        <span class="usage-title">Ban 禁用</span>
                        <span class="usage-total">{{ usage.context.ban.total }}</span>
                    </div>
                    <dl class="usage-grid">
                        <div class="usage-row"><dt>手動</dt><dd>{{ usage.context.ban.manual }}</dd></div>
                        <div class="usage-row"><dt>隨機</dt><dd>{{ usage.context.ban.random }}</dd></div>
                    </dl>
                </div>

                <div class="usage-section">
                    <div class="usage-header">
                        <span class="usage-title">Utility 自由位</span>
                        <span class="usage-total">{{ usage.context.utility.total }}</span>
                    </div>
                    <dl class="usage-grid">
                        <div class="usage-row"><dt>手動·未上場</dt><dd>{{ usage.context.utility.manualNotUsed }}</dd></div>
                        <div class="usage-row"><dt>隨機·未上場</dt><dd>{{ usage.context.utility.randomNotUsed }}</dd></div>
                        <div class="usage-row"><dt>手動·單隊使用</dt><dd>{{ usage.context.utility.manualUsedOneSide }}</dd></div>
                        <div class="usage-row"><dt>隨機·單隊使用</dt><dd>{{ usage.context.utility.randomUsedOneSide }}</dd></div>
                        <div class="usage-row"><dt>手動·雙隊使用</dt><dd>{{ usage.context.utility.manualUsedBothSides }}</dd></div>
                        <div class="usage-row"><dt>隨機·雙隊使用</dt><dd>{{ usage.context.utility.randomUsedBothSides }}</dd></div>
                    </dl>
                </div>
            </div>
            <span v-else-if="!isInitialized" class="hint">載入中…</span>
            <span v-else class="hint">無資料</span>

            <section class="synergy">
                <span class="synergy-title">常用隊友</span>
                <ol v-if="topSynergies.length" class="synergy-list">
                    <li v-for="entry in topSynergies" :key="entry.characterKey" class="synergy-item">
                        <span class="synergy-name">{{ entry.name }}</span>
                        <span class="synergy-count">{{ entry.count }}</span>
                    </li>
                </ol>
                <span v-else-if="!isInitialized" class="hint">載入中…</span>
                <span v-else class="hint">無資料</span>
            </section>

            <p class="footnote">數據為全站歷史統計，非當前對局</p>
        </div>
    </n-popover>
</template>

<style scoped>
.character-hover-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    width: calc(var(--base-size) * 20);
    padding: var(--space-md);
    border-radius: var(--radius-md);
    border-top: 3px solid var(--element-color);
    background-color: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface);
    box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.32));
    font-family: var(--font-family-tech-ui);
}

.header {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.portrait {
    width: calc(var(--base-size) * 3.5);
    height: calc(var(--base-size) * 3.5);
    border-radius: var(--radius-sm);
    object-fit: cover;
    background-color: var(--md-sys-color-surface-container);
}

.title {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: calc(var(--space-xs) / 2);
}

.name {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
}

.rarity {
    color: var(--element-color);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
}

.attributes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xs);
}

.attribute {
    display: flex;
    align-items: baseline;
    gap: var(--space-xs);
}

.attribute dt {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-sm);
}

.attribute dd {
    font-weight: var(--font-weight-medium);
}

.attribute .is-element {
    color: var(--element-color);
}

.priority {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: calc(var(--space-xs) / 2);
}

.priority-value {
    color: var(--element-color);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    line-height: 1;
}

.priority-label {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-xs);
}

.usage {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.usage-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.usage-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
}

.usage-title {
    color: var(--element-color);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
}

.usage-total {
    color: var(--element-color);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
}

.usage-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: calc(var(--space-xs) / 2) var(--space-sm);
}

.usage-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-xs);
}

.usage-row dt {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-sm);
}

.usage-row dd {
    font-weight: var(--font-weight-medium);
}

.synergy {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.synergy-title {
    color: var(--element-color);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
}

.synergy-list {
    display: flex;
    flex-direction: column;
    gap: calc(var(--space-xs) / 2);
    padding: 0;
    list-style: none;
}

.synergy-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.synergy-count {
    color: var(--md-sys-color-on-surface-variant);
}

.hint {
    color: var(--md-sys-color-on-surface-variant);
}

.footnote {
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-xs);
}
</style>
