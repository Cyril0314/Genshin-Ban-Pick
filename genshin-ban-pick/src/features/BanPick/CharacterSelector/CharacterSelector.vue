<!-- src/features/CharacterSelector/CharacterSelector.vue -->

<script setup lang="ts">
import { reactive, watch } from 'vue';

import { useSelectorOptions } from './composables/useSelectorOptions';
import { useFilteredCharacters } from '@/features/BanPick/CharacterSelector/composables/useFilteredCharacters';

import type { ICharacter } from '@/types/ICharacter';

import { ZoneType } from '@/features/BanPick/types/IZone';

import 'vue-select/dist/vue-select.css';
// @ts-ignore
import vSelect from 'vue-select';

import { CommonOption } from './composables/useSelectorOptions';

import type { CharacterFilterKey } from '@/features/BanPick/types/CharacterFilterKey';
import type { SelectorOption } from './composables/useSelectorOptions';

const props = defineProps<{
    characterMap: Record<string, ICharacter>;
}>();

const emit = defineEmits<{
    (e: 'filter-change',  payload: { filteredCharacterKeys: string[]; characterFilter: Record<CharacterFilterKey, string[]> }): void;
    (e: 'random-pull', payload: { zoneType: ZoneType }): void;
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
const filteredCharacterKeys = useFilteredCharacters(props.characterMap, characterFilter);

watch(filteredCharacterKeys, (ids) => emit('filter-change', {filteredCharacterKeys: ids, characterFilter}));

watch(characterFilter, () => normalizeAllSelection(characterFilter, selectorOptions), { deep: true });

function normalizeAllSelection(filter: Record<CharacterFilterKey, string[]>, options: SelectorOption[]) {
    for (const selectorOption of options) {
        const key = selectorOption.key;
        const selected = filter[key];
        const items = selectorOption.items;
        const hasAll = selected.includes(CommonOption.All);
        const itemsWithoutAll = [...items].filter((item) => item !== CommonOption.All);

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
    emit('random-pull', { zoneType: zoneType });
}
</script>

<template>
    <div class="container__selector">
        <div class="selector__row" v-for="selectorOption in selectorOptions" :key="selectorOption.key">
            <!-- <label class="selector__label">{{ filter.label }}：</label> -->
            <v-select class="selector__select" :options="selectorOption.items" :reduce="(val: string) => val"
                :multiple="true" :placeholder="`${selectorOption.label}`"
                :get-option-label="(val: string) => selectorOption.translateFn(val)"
                v-model="characterFilter[selectorOption.key]">
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
                        <span class="selector__selected-option-label">{{ selectorOption.translateFn(option.label)
                            }}</span>
                        <span v-if="!disabled" class="selector__remove-btn" @click.stop="deselect(option.label)"> ×
                        </span>
                    </div>
                </template>
            </v-select>
        </div>
        <div class="selector__toolbar">
            <button class="selector__button selector__button--utility"
                @click="handleRandomButtonClick(ZoneType.Utility)">Utility</button>
            <button class="selector__button selector__button--ban"
                @click="handleRandomButtonClick(ZoneType.Ban)">Ban</button>
            <button class="selector__button selector__button--pick"
                @click="handleRandomButtonClick(ZoneType.Pick)">Pick</button>
        </div>
    </div>
</template>

<style scoped>
.container__selector {
    z-index: 1000;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    /* justify-content: center; */
    column-gap: var(--space-sm);
    row-gap: var(--space-sm);
    width: 100%;
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    background-color: var(--md-sys-color-surface-container-low);
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
    background-color: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    gap: var(--space-xs);
}

.v-select:hover {
    background-color: color-mix(in srgb,
        var(--md-sys-color-surface-container-high),
        white 6%);
    transform: scale(1.02);
}

:deep(.vs__search) {
    font-weight: var(--font-weight-regular);
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
    padding-right: var(--space-sm);
}

.selector__open-indicator {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-regular);
    color: var(--md-sys-color-on-surface);
}

:deep(.v-select.vs--open) {
    z-index: 9999;
}

:deep(.vs__dropdown-menu) {
    background-color: var(--md-sys-color-surface-container);
}

:deep(.vs__dropdown-option) {
    color: var(--md-sys-color-on-surface);
}

:deep(.vs__dropdown-option--highlight) {
    /* background-color: var(--md-sys-color-neutral-focus); */
    background-color: var(--md-sys-color-state-focus);
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
}

.selector__option {
    display: flex;
    width: 100%;
    cursor: pointer;
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-tech-ui);
    font-weight: var(--font-weight-regular);
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
    justify-content: center;
    cursor: pointer;
    padding: calc(var(--space-xs) / 2) 0;
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-surface-container-highest);
    border-radius: var(--radius-xs);
}

.selector__selected-option-label {
    cursor: pointer;
    padding: 0 0 0 var(--space-sm);
    font-size: var(--font-size-sm);
    font-family: var(--font-family-tech-ui);
    font-weight: var(--font-weight-regular);
}

.selector__remove-btn {
    cursor: pointer;
    color: var(--md-sys-color-on-surface);
    padding: 0 var(--space-xs);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-regular);
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
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-tech-ui);
    white-space: nowrap;
}

.selector__toolbar {
    /* grid-column: span 4; */
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
    background-color: var(--md-sys-color-tertiary-container);
    color: var(--md-sys-color-on-tertiary-container);
    border: none;
    border-radius: var(--radius-sm);
    padding: var(--space-sm);
    cursor: pointer;
    transition:
        background-color 0.3s ease,
        transform 0.2s ease;
    text-align: center;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-tech-ui);
}

.selector__button:hover {
    background-color: var(--tertiary-filled-hover);
    transform: scale(1.05);
}

.selector__button:active {
    transform: scale(0.98);
}
</style>
