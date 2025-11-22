// src/modules/board/application/boardUseCase.ts

import { handleBoardImageDropDomain } from '../domain/handleBoardImageDropDomain';
import { handleBoardImageMapResetDomain } from '../domain/handleBoardImageMapResetDomain';
import { handleBoardImageRestoreDomain } from '../domain/handleBoardImageRestoreDomain';
import { useBoardImageStore } from '../store/boardImageStore';
import type { BoardImageMap } from '../types/BoardImageMap';

export function boardUseCase() {
    const boardStore = useBoardImageStore();

    function initZoneMetaTable(zoneMetaTable: Record<number, any>) {
        boardStore.initZoneMetaTable(zoneMetaTable);
    }

    function handleBoardImageDrop(zoneId: number, imgId: string) {
        const prevMap = boardStore.boardImageMap;
        const nextMap = handleBoardImageDropDomain(prevMap, zoneId, imgId);
        boardStore.setBoardImageMap(nextMap);
    }

    function handleBoardImageRestore(zoneId: number) {
        const prevMap = boardStore.boardImageMap;
        const nextMap = handleBoardImageRestoreDomain(prevMap, zoneId);
        boardStore.setBoardImageMap(nextMap);
    }

    function handleBoardImageMapReset() {
        const prevMap = boardStore.boardImageMap;
        const nextMap = handleBoardImageMapResetDomain(prevMap);
        boardStore.setBoardImageMap(nextMap);
    }

    function setBoardImageMap(newBoardImageMap: BoardImageMap) {
        boardStore.setBoardImageMap(newBoardImageMap);
    }

    return {
        initZoneMetaTable,
        handleBoardImageDrop,
        handleBoardImageRestore,
        handleBoardImageMapReset,
        setBoardImageMap,
    };
}
