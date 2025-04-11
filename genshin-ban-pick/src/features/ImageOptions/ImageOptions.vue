<!-- src/features/ImageOptions/ImageOptions.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { CharacterMap } from '@/types/Character'
import { getProfileImagePath } from '@/utils/imageRegistry'

const props = defineProps<{
    characterMap: CharacterMap
    usedIds: string[]
}>()

const availableCharacters = computed(() =>
    Object.entries(props.characterMap)
        .filter(([id]) => !props.usedIds.includes(id))
        .sort(([a], [b]) => a.localeCompare(b))
)
</script>

<template>
    <div id="image-options" class="image-options">
        <img v-for="[id, char] in availableCharacters" :key="id" :id="id" :src="getProfileImagePath(id)"
            draggable="true" />
    </div>
</template>

<style scoped>
.image-options {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: 190px;
    overflow-y: auto;
    align-items: flex-start;
    justify-content: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.1);
}

.image-options img {
    width: 90px;
    height: auto;
    cursor: grab;
}

</style>