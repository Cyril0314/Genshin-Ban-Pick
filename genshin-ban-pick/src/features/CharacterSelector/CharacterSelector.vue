<!-- src/features/CharacterSelector/CharacterSelector.vue -->

<script setup lang="ts">
import { reactive, watch } from 'vue';

import { useSelectorOptions } from './composables/useSelectorOptions';
import { useFilteredCharacters } from '@/features/CharacterSelector/composables/useFilteredCharacters';

import type { ICharacter } from '@/types/ICharacter';

import { ZoneType } from '@/types/IZone';

import 'vue-select/dist/vue-select.css';
// @ts-ignore
import vSelect from 'vue-select';

import { CommonOption } from './composables/useSelectorOptions';

import type { CharacterFilterKey } from '@/types/CharacterFilterKey';
import type { SelectorOption } from './composables/useSelectorOptions';

const props = defineProps<{
    characterMap: Record<string, ICharacter>;
}>();

const emit = defineEmits<{
    (e: 'filter-change', filteredCharacterIds: string[]): void;
    (e: 'random-button-click', payload: { zoneType: ZoneType }): void;
}>();

const selectorOptions = useSelectorOptions(props.characterMap);
const characterFilter = reactive<Record<CharacterFilterKey, string[]>>({
    weapon: [],
    element: [],
    region: [],
    rarity: [],
    modelType: [],
    role: [],
    wish: [],
});
const filteredCharacterIds = useFilteredCharacters(props.characterMap, characterFilter);

watch(filteredCharacterIds, (ids) => emit('filter-change', ids));

watch(characterFilter, () => normalizeAllSelection(characterFilter, selectorOptions), { deep: true });

function normalizeAllSelection(filter: Record<CharacterFilterKey, string[]>, options: SelectorOption[]) {
    for (const selectorOption of options) {
        const key = selectorOption.key;
        const selected = filter[key];
        const items = selectorOption.items;
        const hasAll = selected.includes(CommonOption.ALL);
        const itemsWithoutAll = [...items].filter((item) => item !== CommonOption.ALL);

        if (hasAll) {
            if (selected.length - 1 < itemsWithoutAll.length) {
                console.debug(`[CHARACTER SELECTOR] ${key} selector selected all`);
                filter[key] = itemsWithoutAll;
            } else {
                console.debug(`[CHARACTER SELECTOR] ${key} selector unselected all`);
                filter[key] = [];
            }
        } else {
          console.debug(`[CHARACTER SELECTOR] ${key} selector selected`, selected);
        }
    }
}

function handleRandomButtonClick(zoneType: ZoneType) {
    console.debug(`[CHARACTER SELECTOR] Handle random button click`, zoneType);
    emit('random-button-click', { zoneType: zoneType });
}
</script>

<template>
    <div class="container__selector">
        <div class="selector__row" v-for="selectorOption in selectorOptions" :key="selectorOption.key">
            <!-- <label class="selector__label">{{ filter.label }}：</label> -->
            <v-select
                class="selector__select"
                :options="selectorOption.items"
                :reduce="(val: string) => val"
                :multiple="true"
                :placeholder="`${selectorOption.label}`"
                :get-option-label="(val: string) => selectorOption.translateFn(val)"
                v-model="characterFilter[selectorOption.key]"
            >
                <template #open-indicator="{ attributes }">
                    <span class="selector__open-indicator" v-bind="attributes">▲</span>
                </template>
                <template #option="{ label }">
                    <div class="selector__option">
                        <span>{{ selectorOption.translateFn(label) }}</span>
                    </div>
                </template>
                <template #selected-option-container="{ option, deselect, multiple, disabled }">
                    <div class="selector__selected-option">
                        <span class="selector__selected-option-label">{{ selectorOption.translateFn(option.label) }}</span>
                        <span v-if="!disabled" class="selector__remove-btn" @click.stop="deselect(option.label)"> × </span>
                    </div>
                </template>
            </v-select>
        </div>
        <div class="selector__toolbar">
            <button class="selector__button selector__button--utility" @click="handleRandomButtonClick(ZoneType.UTILITY)">Utility</button>
            <button class="selector__button selector__button--ban" @click="handleRandomButtonClick(ZoneType.BAN)">Ban</button>
            <button class="selector__button selector__button--pick" @click="handleRandomButtonClick(ZoneType.PICK)">Pick</button>
        </div>
    </div>
</template>

<style scoped>
.container__selector {
    z-index: 1000;
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: start;
    column-gap: var(--space-sm);
    row-gap: var(--space-sm);
    width: 100%;
    padding: var(--space-sm);
    border-radius: var(--border-radius-xs);
    background-color: var(--md-sys-color-surface-container-alpha);
    backdrop-filter: var(--backdrop-filter);
    box-shadow: var(--box-shadow);
}

.selector__row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    width: 100%;
    /* height: var(--size-selector-height); */
}

.v-select {
    flex-grow: 1;
    --vs-font-size: var(--font-size-sm);
    --vs-font-family: var(--font-family-tech-ui);
    background-color: var(--md-sys-color-surface-container-high-alpha);
    color: var(--md-sys-color-on-surface-variant);
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius-xs);
    cursor: pointer;
    transition: all 0.2s ease;
    /* height: var(--size-selector-height); */
    /* overflow-y: auto; */
    gap: var(--space-xs);
}

.v-select:hover {
    background-color: var(--md-sys-color-surface-container-highest-alpha);
    transform: scale(1.02);
}

:deep(.vs__search) {
    font-weight: var(--font-weight-bold);
    text-align: start;
    padding: 0px;
}

:deep(.vs__dropdown-toggle) {
    display: flex;
    align-items: center;
    padding: 0px;
    gap: 0px;
}

:deep(.vs__actions) {
    display: flex;
    align-items: center;
    padding-right: var(--space-xs);
}

.selector__open-indicator {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface-variant);
}

:deep(.v-select.vs--open) {
    z-index: 9999;
}

:deep(.vs__dropdown-menu) {
    background-color: var(--md-sys-color-surface-container-highest);
}

:deep(.vs__dropdown-option) {
    background-color: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface-variant);
}

:deep(.vs__dropdown-option--highlight) {
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
}

.selector__option {
    display: flex;
    width: 100%;
    cursor: pointer;
    color: var(--md-sys-color-on-surface-variant);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-tech-ui);
    font-weight: var(--font-weight-medium);
}

:deep(.vs__selected-options) {
    display: flex;
    align-items: center;
    padding: var(--space-xs);
    gap: var(--space-xs);
    flex-wrap: wrap;
}

.selector__selected-option {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: var(--md-sys-color-on-primary-container);
    background-color: var(--md-sys-color-surface-tint);
    border-radius: var(--border-radius-xs);
}

.selector__selected-option-label {
    cursor: pointer;
    padding: 0 0 0 var(--space-xs);
    font-size: var(--font-size-xs);
    font-family: var(--font-family-tech-ui);
    font-weight: var(--font-weight-medium);
}

.selector__remove-btn {
    cursor: pointer;
    color: var(--md-sys-color-on-primary-container);
    padding: 0 calc(var(--space-xs) / 2) calc(var(--space-xs) / 2) 0;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    transition: color 0.2s ease;
}

.selector__remove-btn:hover {
    transform: scale(1.1);
}

.selector__remove-btn:active {
    transform: scale(0.98);
}

.container__selector label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family-tech-ui);
    white-space: nowrap;
}

.selector__toolbar {
    grid-column: span 2;
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: var(--space-sm);
}

.selector__button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    z-index: 50;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border: none;
    border-radius: var(--border-radius-xs);
    padding: var(--space-sm);
    cursor: pointer;
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
    box-shadow: var(--box-shadow);
    text-align: center;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-tech-ui);
}

.selector__button:hover {
    background-color: var(--md-sys-color-surface-tint);
    transform: scale(1.05);
}

.selector__button:active {
    transform: scale(0.98);
}
</style>
