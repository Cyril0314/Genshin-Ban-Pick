<!-- src/views/BanPickView.vue -->

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import ImageOptions from '@/features/ImageOptions/ImageOptions.vue'
import BanPickBoard from '@/features/BanPick/BanPickBoard.vue'
import Toolbar from '@/features/BanPick/components/ToolBar.vue'
import { fetchCharacterMap } from '@/network/characterService'
import { fetchRoomSetting } from '@/network/roomService'
import { useBanPickImageSync } from '@/features/BanPick/composables/useBanPickImageSync'
import {
  handleUtilityRandom,
  handleBanRandom,
  handlePickRandom,
} from '@/features/BanPick/composables/useRandomizeImage'
import { useFilteredCharacters } from '@/composables/useFilteredCharacters'
import type { RoomSetting } from '@/types/RoomSetting'

const characterMap = ref({})
const roomSetting = ref<RoomSetting | null>(null)
const currentFilters = ref({
  weapon: 'All',
  element: 'All',
  region: 'All',
  rarity: 'All',
  model_type: 'All',
  role: 'All',
  wish: 'All',
})
const {
  imageMap,
  usedIds,
  handleImageDropped,
  handleImageRestore,
  handleImageReset,
  handleBanPickRecord,
} = useBanPickImageSync(roomSetting)
const filteredCharacterIds = useFilteredCharacters(characterMap, currentFilters)

onMounted(async () => {
  try {
    characterMap.value = await fetchCharacterMap()
    roomSetting.value = await fetchRoomSetting()
    console.log('[BanPickView] roomSetting:', roomSetting.value)
  } catch (error) {
    console.error('[BanPickView] 無法載入角色資料:', error)
  }
})

function handleFilterChanged(newFilters: Record<string, string>) {
  Object.assign(currentFilters.value, newFilters)
}

function handleRandomPull({ zoneType }: { zoneType: 'utility' | 'ban' | 'pick' }) {
  console.log('父元件收到隨機抽選按鈕點擊事件：', zoneType)

  if (!roomSetting.value || filteredCharacterIds.value.length === 0) {
    console.warn('無法進行隨機抽選：房間未就緒或無符合條件的角色')
    return
  }

  const ctx = {
    roomSetting: roomSetting.value,
    filteredIds: filteredCharacterIds.value,
    imageMap: imageMap.value,
    handleImageDropped,
  }
  if (zoneType === 'pick') {
    handlePickRandom(ctx)
  } else if (zoneType === 'ban') {
    handleBanRandom(ctx)
  } else if (zoneType === 'utility') {
    handleUtilityRandom(ctx)
  }
}
</script>

<template>
  <div>
    <div class="background-image"></div>
    <div class="layout">
      <ImageOptions
        :characterMap="characterMap"
        :usedIds="usedIds"
        :filteredIds="filteredCharacterIds"
      />
      <Toolbar @reset="handleImageReset" @record="handleBanPickRecord" />
      <BanPickBoard
        v-if="roomSetting"
        :roomSetting="roomSetting"
        :characterMap="characterMap"
        :imageMap="imageMap"
        @image-drop="handleImageDropped"
        @image-restore="handleImageRestore"
        @filter-changed="handleFilterChanged"
        @pull="handleRandomPull"
      />
      <div v-else class="loading">載入房間設定中...</div>
    </div>
  </div>
</template>

<style scoped>
.background-image {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  width: 100vw;
  height: 100vh;
  background: url('@/assets/images/background/wallpaper3.png') no-repeat center center;
  background-size: cover;
  background-blend-mode: multiply;
  background-color: rgba(0, 0, 0, 0.2);
  opacity: 0.4;
}

.layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  /* max-width: 2560px; */
  width: 2560px;
  /* width: 100%; */
}
</style>
