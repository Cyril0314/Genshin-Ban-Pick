<script setup lang="ts">
import { computed, ref } from 'vue';

import type { CharacterFilterKey } from '@shared/contracts/character/CharacterFilterKey';

const props = defineProps<{
    modelValue: CharacterFilterKey[];
    options: { key: CharacterFilterKey; label: string }[];
}>();

const emit = defineEmits<{ 'update:modelValue': [CharacterFilterKey[]] }>();

const labelOf = (key: CharacterFilterKey) => props.options.find((o) => o.key === key)?.label ?? key;

const available = computed(() => props.options.filter((o) => !props.modelValue.includes(o.key)));

const dragKey = ref<CharacterFilterKey | null>(null);

function onDragStart(key: CharacterFilterKey) {
    dragKey.value = key;
}

function onDropToAvailable() {
    const key = dragKey.value;
    dragKey.value = null;
    if (key) removeLayer(key);
}

// 插到 beforeKey 之前；beforeKey 為 null 代表接到最後面
function moveInto(beforeKey: CharacterFilterKey | null) {
    const key = dragKey.value;
    if (!key) return;
    const without = props.modelValue.filter((k) => k !== key);
    const index = beforeKey ? without.indexOf(beforeKey) : without.length;
    without.splice(index < 0 ? without.length : index, 0, key);
    emit('update:modelValue', without);
    dragKey.value = null;
}

function removeLayer(key: CharacterFilterKey) {
    // 最少保留一層
    if (props.modelValue.length <= 1) return;
    emit(
        'update:modelValue',
        props.modelValue.filter((k) => k !== key),
    );
}

function addLayer(key: CharacterFilterKey) {
    if (props.modelValue.includes(key)) return;
    emit('update:modelValue', [...props.modelValue, key]);
}
</script>

<template>
    <div class="picker">
        <div class="zone">
            <span class="zone-label">已篩選層級</span>
            <div class="chips is-selected" @dragover.prevent @drop="moveInto(null)">
                <div
                    v-for="(key, index) in modelValue"
                    :key="key"
                    class="chip is-selected"
                    draggable="true"
                    @dragstart="onDragStart(key)"
                    @dragover.prevent
                    @drop.stop="moveInto(key)"
                >
                    <span class="order">{{ index + 1 }}</span>
                    <span class="text">{{ labelOf(key) }}</span>
                    <button class="remove" :disabled="modelValue.length <= 1" title="移除" @click="removeLayer(key)">×</button>
                </div>
                <span class="leaf-hint">→ 角色</span>
            </div>
        </div>

        <div class="zone">
            <span class="zone-label">可用篩選層級</span>
            <div class="chips" @dragover.prevent @drop="onDropToAvailable">
                <div
                    v-for="opt in available"
                    :key="opt.key"
                    class="chip"
                    draggable="true"
                    @dragstart="onDragStart(opt.key)"
                    @click="addLayer(opt.key)"
                >
                    <span class="text">{{ opt.label }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.picker {
    display: flex;
    flex-direction: row;
    gap: var(--space-sm);
}

.zone {
    display: flex;
    flex: 1 1 0;
    min-width: 0;
    flex-direction: column;
    gap: var(--space-xs);
    height: 100%;
}

.zone-label {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
}

.chips {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    flex: 1;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm);
    border: 1px dashed var(--md-sys-color-outline-variant);
    border-radius: var(--radius-md);
}

.chips.is-selected {
    background-color: var(--md-sys-color-surface-container-low);
}

.chip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
    padding: var(--space-xxs) var(--space-sm);
    border-radius: var(--radius-sm);
    background-color: var(--md-sys-color-surface-container-high);
    min-width: calc(var(--base-size) * 4.5);
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    cursor: grab;
    user-select: none;
}

.chip.is-selected {
    background-color: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
}

.chip:active {
    cursor: grabbing;
}

.order {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--base-size);
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: var(--md-sys-color-secondary);
    color: var(--md-sys-color-on-secondary);
    font-size: var(--font-size-sm);
}

.remove {
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font-size: var(--font-size-md);
    line-height: 1;
    cursor: pointer;
}

.remove:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.leaf-hint {
    font-size: var(--font-size-md);
    color: var(--md-sys-color-on-surface-variant);
    font-weight: var(--font-weight-bold);
}
</style>
