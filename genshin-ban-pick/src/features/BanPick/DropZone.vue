<!-- src/features/BanPick/DropZone.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { getWishImagePath } from '@/utils/imageRegistry'

const props = defineProps<{
    zoneId: string
    imageId?: string
}>()

const emit = defineEmits<{
    (e: 'drop', payload: { imgId: string; zoneId: string }): void
    (e: 'restore', payload: { imgId: string }): void
}>()

const isOver = ref(false)

function handleDrop(e: DragEvent) {
    e.preventDefault()
    isOver.value = false

    const imgId = e.dataTransfer?.getData('text/plain')
    if (!imgId || props.imageId) return

    emit('drop', { imgId, zoneId: props.zoneId })
}

function handleClickRestore(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === 'IMG' && props.imageId) {
        emit('restore', { imgId: props.imageId })
    }
}
</script>

<template>
    <div class="drop-zone" :class="{ 'drop-zone--active': isOver }" @dragover.prevent="isOver = true"
        @dragleave="isOver = false" @drop="handleDrop" @click="handleClickRestore">
        <img v-if="imageId" :src="getWishImagePath(imageId)" />
    </div>
</template>

<style scoped>
.drop-zone {
    width: 160px;
    height: 90px;
    position: relative;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    backdrop-filter: blur(4px);
    overflow: hidden;
}

.drop-zone:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
}

.drop-zone img {
    height: auto;
    z-index: 15;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.drop-zone.highlight {
    outline: 4px solid rgba(255, 200, 0, 0.9);
    box-shadow:
        0 0 10px rgba(255, 200, 0, 0.5),
        0 0 25px rgba(255, 150, 0, 0.6);
    animation: intensePulse 0.8s infinite ease-in-out;
    transform: scale(1.07);
    border-radius: 10px;
}

@keyframes intensePulse {
    0% {
        box-shadow: 0 0 8px rgba(255, 200, 0, 0.3);
    }

    50% {
        box-shadow: 0 0 20px rgba(255, 120, 0, 0.8);
    }

    100% {
        box-shadow: 0 0 8px rgba(255, 200, 0, 0.3);
    }
}
</style>
