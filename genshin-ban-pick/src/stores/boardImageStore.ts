// src/stores/boardImageStore.ts

import { defineStore, } from 'pinia';
import { ref, computed, watch, } from 'vue';

type BoardImageMap = Record<string, string>;

export const useBoardImageStore = defineStore('boardImage', () => {
    const boardImageMap = ref<BoardImageMap>({})

    const usedImageIds = computed(() => [...new Set(Object.values(boardImageMap.value))])

    function setBoardImageMap(newBoardImageMap: BoardImageMap) {
        boardImageMap.value = { ...newBoardImageMap }
    }

    function placeBoardImage(imgId: string, zoneId: string) {
        boardImageMap.value[zoneId] = imgId
    }

    function removeBoardImage(zoneId: string) {
        delete boardImageMap.value[zoneId]
    }

    function resetBoardImageMap() {
        boardImageMap.value = {}
    }

    function findZoneIdByImageId(imgId: string): string | undefined {
        return Object.entries(boardImageMap.value).find(([, id]) => id === imgId)?.[0]
    }

    return {
        boardImageMap,
        usedImageIds,
        setBoardImageMap,
        placeBoardImage,
        removeBoardImage,
        resetBoardImageMap,
        findZoneIdByImageId
    }
})