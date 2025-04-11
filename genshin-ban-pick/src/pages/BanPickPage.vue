<!-- src/pages/BanPickPage.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ImageOptions from '@/features/ImageOptions/ImageOptions.vue'
import BanPickBoard from '@/features/BanPick/BanPickBoard.vue'
import { fetchCharacterMap } from '@/network/characterService'
import type { RoomSetting } from '@/types/RoomSetting'
import { fetchRoomSetting } from '@/network/roomService'

const usedIds = ref<string[]>([])
const characterMap = ref({})
const roomSetting = ref<RoomSetting | null>(null)

function handleImageDropped(id: string) {
    if (!usedIds.value.includes(id)) usedIds.value.push(id)
}

function handleImageRestored(id: string) {
    usedIds.value = usedIds.value.filter(x => x !== id)
}

onMounted(async () => {
    try {
        characterMap.value = await fetchCharacterMap()
        roomSetting.value = await fetchRoomSetting()
    } catch (error) {
        console.error('[BanPickPage] 無法載入角色資料:', error)
    }
})
</script>

<template>
    <div>
        <ImageOptions :characterMap="characterMap" :usedIds="usedIds" />
        <BanPickBoard v-if="roomSetting" :roomSetting="roomSetting" @imageDropped="handleImageDropped" @imageRestored="handleImageRestored" />
        <div v-else class="loading">載入房間設定中...</div>
    </div>
</template>