// src/stores/boardImageStore.ts

import { defineStore, } from 'pinia';
import { ref, computed, watch, } from 'vue';

import type { IZone } from '@/types/IZone';

type BoardImageMap = Record<number, string>;

export const useBoardImageStore = defineStore('boardImage', () => {
    const zoneMetaTable = ref<Record<number, IZone>>({})
    const boardImageMap = ref<BoardImageMap>({})
    const usedImageIds = computed(() => [...new Set(Object.values(boardImageMap.value).map(imgId => imgId))])

    function initZoneMetaTable(table: Record<number, IZone>) {
        zoneMetaTable.value = { ...table }
    }

    function setBoardImageMap(newBoardImageMap: BoardImageMap) {
        boardImageMap.value = { ...newBoardImageMap }
    }

    function placeBoardImage(imageId: string, zoneId: number) {
        boardImageMap.value[zoneId] = imageId
    }

    function removeBoardImage(zoneId: number) {
        delete boardImageMap.value[zoneId]
    }

    function resetBoardImageMap() {
        boardImageMap.value = {}
    }

    function findZoneIdByImageId(imgId: string) {
        const value = Object.entries(boardImageMap.value).find(([, f]) => f === imgId)
        console.log(`${value}`)
        if (!value) return null;
        return Number(value[0])
    }

    return {
        zoneMetaTable,
        boardImageMap,
        usedImageIds,
        initZoneMetaTable,
        setBoardImageMap,
        placeBoardImage,
        removeBoardImage,
        resetBoardImageMap,
        findZoneIdByImageId
    }
})