// src/modules/board/store/boardImageStore.ts

import { defineStore } from 'pinia';
import { ref, computed, watch, shallowRef } from 'vue';

import { createLogger } from '@/app/utils/logger';

const logger = createLogger('board.store');

import type { IZone } from '@shared/contracts/board/IZone';
import type { IMatchStep } from '@shared/contracts/match/IMatchStep';
import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';

export const useBoardStore = defineStore('boardImage', () => {
    const zoneMetaTable = shallowRef<Record<number, IZone>>({});
    const matchSteps = shallowRef<IMatchStep[]>([]);
    const boardImageMap = ref<BoardImageMap>({});
    const usedImageIds = computed(() => [...new Set(Object.values(boardImageMap.value).map((imgId) => imgId))]);

    const currentStep = computed(() => {
        const step = matchSteps.value.find((step: IMatchStep) => {
            return !boardImageMap.value[step.zoneId];
        });
        if (!step) {
            return undefined;
        }
        return step;
    });

    watch(
        usedImageIds,
        (usedImageIds) => {
            logger.debug('watch used image ids', usedImageIds);
        },
        { immediate: true },
    );

    function initZoneMetaTableAndSteps(newZoneMetaTable: Record<number, IZone>, newMatchSteps: IMatchStep[]) {
        logger.debug('init zone meta table', newZoneMetaTable);
        zoneMetaTable.value = newZoneMetaTable;
        matchSteps.value = newMatchSteps;
    }

    function setBoardImageMap(newBoardImageMap: BoardImageMap) {
        logger.debug('set board image map', newBoardImageMap);
        boardImageMap.value = { ...newBoardImageMap };
    }

    return {
        zoneMetaTable,
        matchSteps,
        boardImageMap,
        usedImageIds,
        currentStep,
        initZoneMetaTableAndSteps,
        setBoardImageMap,
    };
});
