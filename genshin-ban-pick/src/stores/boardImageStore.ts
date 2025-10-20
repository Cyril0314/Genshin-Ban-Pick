// src/stores/boardImageStore.ts

import { defineStore, } from 'pinia';
import { ref, computed, watch, } from 'vue';

import type { IZone, IZoneImageEntry } from '@/types/IZone';

type BoardImageMap = Record<string, IZoneImageEntry>;

export const useBoardImageStore = defineStore('boardImage', () => {
    const boardImageMap = ref<BoardImageMap>({})

    const usedImageIds = computed(() => [...new Set(Object.values(boardImageMap.value).map(entry => entry.imgId))])

    function setBoardImageMap(newBoardImageMap: BoardImageMap) {
        boardImageMap.value = { ...newBoardImageMap }
    }

    function placeBoardImage(zoneImageEntry: IZoneImageEntry, zoneKey: string) {
        boardImageMap.value[zoneKey] = zoneImageEntry
    }

    function removeBoardImage(zoneKey: string) {
        delete boardImageMap.value[zoneKey]
    }

    function resetBoardImageMap() {
        boardImageMap.value = {}
    }

    function findZoneImageEntryByImageId(imgId: string) {
        const value = Object.entries(boardImageMap.value).find(([, entry]) => entry.imgId === imgId)
        if (!value) return null;
        return value[1] as IZoneImageEntry
    }

    return {
        boardImageMap,
        usedImageIds,
        setBoardImageMap,
        placeBoardImage,
        removeBoardImage,
        resetBoardImageMap,
        findZoneImageEntryByImageId
    }
})