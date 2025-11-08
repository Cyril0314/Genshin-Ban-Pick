// src/stores/boardImageStore.ts

import { defineStore, } from 'pinia';
import { ref, computed, watch, shallowRef} from 'vue';

import type { IZone } from '@/types/IZone';

type BoardImageMap = Record<number, string>;

export const useBoardImageStore = defineStore('boardImage', () => {
    const zoneMetaTable = shallowRef<Record<number, IZone>>({})
    const boardImageMap = ref<BoardImageMap>({})
    const usedImageIds = computed(() => [...new Set(Object.values(boardImageMap.value).map(imgId => imgId))])
    const randomCotextMap = 

    watch(usedImageIds, (usedImageIds) => {
        console.debug('[BOARD IMAGE STORE] Watch used image ids', usedImageIds)
    }, { immediate: true })

    function initZoneMetaTable(newZoneMetaTable: Record<number, IZone>) {
        console.debug('[BOARD IMAGE STORE] Init zone meta table', newZoneMetaTable)
        zoneMetaTable.value = newZoneMetaTable
    }

    function setBoardImageMap(newBoardImageMap: BoardImageMap) {
        console.debug('[BOARD IMAGE STORE] Set board image map', newBoardImageMap)
        boardImageMap.value = { ...newBoardImageMap }
    }

    function placeBoardImage(zoneId: number, imageId: string) {
        console.debug('[BOARD IMAGE STORE] Place board image', imageId, zoneId)
        boardImageMap.value[zoneId] = imageId
    }

    function removeBoardImage(zoneId: number) {
        console.debug('[BOARD IMAGE STORE] Remove board image', zoneId)
        delete boardImageMap.value[zoneId]
    }

    function resetBoardImageMap() {
        console.debug('[BOARD IMAGE STORE] Reset board image map')
        boardImageMap.value = {}
    }

    function findZoneIdByImageId(imgId: string): number | null {
        const value = Object.entries(boardImageMap.value).find(([, f]) => f === imgId)
        if (!value) {
            console.debug('[BOARD IMAGE STORE] Cannot find zone id by image id', imgId)
            return null
        }
        console.debug('[BOARD IMAGE STORE] Find zone id by image id', value[0], imgId)
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