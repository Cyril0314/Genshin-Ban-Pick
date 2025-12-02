// src/modules/board/application/BoardUseCase.ts

import type { IZone } from '@shared/contracts/board/IZone';
import { handleBoardImageDropDomain } from '../domain/handleBoardImageDropDomain';
import { handleBoardImageMapResetDomain } from '../domain/handleBoardImageMapResetDomain';
import { handleBoardImageRestoreDomain } from '../domain/handleBoardImageRestoreDomain';
import { useBoardStore } from '../store/boardStore';

import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';
import type { IMatchStep } from '@shared/contracts/match/IMatchStep';

export default class BoardUseCase {
    constructor(private boardStore: ReturnType<typeof useBoardStore>) {}

    initZoneMetaTableAndSteps(zoneMetaTable: Record<number, IZone>, matchSteps: IMatchStep[]) {
        this.boardStore.initZoneMetaTableAndSteps(zoneMetaTable, matchSteps);
    }

    handleBoardImageDrop(zoneId: number, imgId: string) {
        const prevMap = this.boardStore.boardImageMap;
        const nextMap = handleBoardImageDropDomain(prevMap, zoneId, imgId);
        this.boardStore.setBoardImageMap(nextMap);
    }

    handleBoardImageRestore(zoneId: number) {
        const prevMap = this.boardStore.boardImageMap;
        const nextMap = handleBoardImageRestoreDomain(prevMap, zoneId);
        this.boardStore.setBoardImageMap(nextMap);
    }

    handleBoardImageMapReset() {
        const prevMap = this.boardStore.boardImageMap;
        const nextMap = handleBoardImageMapResetDomain(prevMap);
        this.boardStore.setBoardImageMap(nextMap);
    }

    setBoardImageMap(newBoardImageMap: BoardImageMap) {
        this.boardStore.setBoardImageMap(newBoardImageMap);
    }
}
