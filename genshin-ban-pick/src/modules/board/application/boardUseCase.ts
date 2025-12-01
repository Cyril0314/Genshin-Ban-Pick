// src/modules/board/application/BoardUseCase.ts

import { handleBoardImageDropDomain } from '../domain/handleBoardImageDropDomain';
import { handleBoardImageMapResetDomain } from '../domain/handleBoardImageMapResetDomain';
import { handleBoardImageRestoreDomain } from '../domain/handleBoardImageRestoreDomain';
import { useBoardImageStore } from '../store/boardImageStore';

import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';

export default class BoardUseCase {
    constructor(private boardImageStore: ReturnType<typeof useBoardImageStore>) {}

    initZoneMetaTable(zoneMetaTable: Record<number, any>) {
        this.boardImageStore.initZoneMetaTable(zoneMetaTable);
    }

    handleBoardImageDrop(zoneId: number, imgId: string) {
        const prevMap = this.boardImageStore.boardImageMap;
        const nextMap = handleBoardImageDropDomain(prevMap, zoneId, imgId);
        this.boardImageStore.setBoardImageMap(nextMap);
    }

    handleBoardImageRestore(zoneId: number) {
        const prevMap = this.boardImageStore.boardImageMap;
        const nextMap = handleBoardImageRestoreDomain(prevMap, zoneId);
        this.boardImageStore.setBoardImageMap(nextMap);
    }

    handleBoardImageMapReset() {
        const prevMap = this.boardImageStore.boardImageMap;
        const nextMap = handleBoardImageMapResetDomain(prevMap);
        this.boardImageStore.setBoardImageMap(nextMap);
    }

    setBoardImageMap(newBoardImageMap: BoardImageMap) {
        this.boardImageStore.setBoardImageMap(newBoardImageMap);
    }
}
