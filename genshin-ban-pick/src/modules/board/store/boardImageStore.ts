// src/modules/board/store/boardImageStore.ts

import { defineStore, } from 'pinia';
import { ref, computed, watch, shallowRef} from 'vue';

import type { IZone } from '../types/IZone';
import type { BoardImageMap } from '../types/BoardImageMap';

export const useBoardImageStore = defineStore('boardImage', () => {
    const zoneMetaTable = shallowRef<Record<number, IZone>>({})
    const boardImageMap = ref<BoardImageMap>({})
    const usedImageIds = computed(() => [...new Set(Object.values(boardImageMap.value).map(imgId => imgId))])

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

    return {
        zoneMetaTable,
        boardImageMap,
        usedImageIds,
        initZoneMetaTable,
        setBoardImageMap,
    }
})