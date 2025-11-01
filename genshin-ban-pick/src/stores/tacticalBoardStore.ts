// src/stores/taticalBoardStore.ts

import { computed, reactive, ref, watch, type Ref } from "vue";
import { defineStore } from "pinia";

import type { ITeam } from "@/types/ITeam";

export type TacticalCellImageMap = Record<string, string>

export const useTaticalBoardStore = defineStore('taticalBoard', () => {
    const teamTaticalBoardPanelMap: Record<number, {
        poolImageIds: string[];
        cellImageMap: TacticalCellImageMap;
    }> = reactive({});

    const displayPoolImageIds = (teamId: number) => computed(() => {
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return [];
        const used = new Set(Object.values(taticalBoardPanel.cellImageMap));
        return taticalBoardPanel.poolImageIds.filter(id => !used.has(id));
    });

    watch(teamTaticalBoardPanelMap, (teamTaticalBoardPanelMap) => {
        console.debug('[TATICAL BOARD STORE] Watch team tatical board panel map', teamTaticalBoardPanelMap)
        // console.table(
        //     Object.entries(teamTaticalBoardPanelMap).map(([id, panel]) => ({
        //         teamId: id,
        //         hasPool: !!panel?.poolImageIds,
        //         hasMap: !!panel?.cellImageMap,
        //     }))
        // )
    }, { deep: true, immediate: true })


    function initTeamTaticalBoardMap(teams: ITeam[]) {
        console.debug('[TATICAL BOARD STORE] Init team tatical board panel map', teams)
        for (const team of teams) {
            teamTaticalBoardPanelMap[team.id] = {
                poolImageIds: [],
                cellImageMap: {}
            };
        }
    }

    function addImageToPool(teamId: number, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Add image to pool', teamId, imgId)
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return;
        if (!taticalBoardPanel.poolImageIds.includes(imgId)) {
            taticalBoardPanel.poolImageIds.push(imgId)
        }
    }

    function removeImageFromBoard(teamId: number, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Remove image from board', teamId, imgId)
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return;
        const index = taticalBoardPanel.poolImageIds.indexOf(imgId)
        if (index !== -1) {
            taticalBoardPanel.poolImageIds.splice(index, 1)
        }
        for (const [k, v] of Object.entries(taticalBoardPanel.cellImageMap)) {
            if (v === imgId) delete taticalBoardPanel.cellImageMap[k]
        }
    }

    function placeCellImage(teamId: number, cellId: string, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Place cell image', teamId, cellId, imgId)
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return;
        for (const [k, v] of Object.entries(taticalBoardPanel.cellImageMap)) {
            if (v === imgId) delete taticalBoardPanel.cellImageMap[k]
        }
        taticalBoardPanel.cellImageMap[cellId] = imgId
    }

    function removeCellImage(teamId: number, cellId: string) {
        console.debug('[TATICAL BOARD STORE] Remove cell image', teamId, cellId)
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return;
        delete taticalBoardPanel.cellImageMap[cellId]
    }

    function reset(teamId: number) {
        console.debug('[TATICAL BOARD STORE] Reset', teamId)
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return;
        taticalBoardPanel.poolImageIds = []
        taticalBoardPanel.cellImageMap = {}
    }

    function setTaticalCellImageMap(teamId: number, taticalCellImageMap: TacticalCellImageMap) {
        console.debug('[TATICAL BOARD STORE] Set tatical cell image map', teamId, taticalCellImageMap)
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return;
        taticalBoardPanel.cellImageMap = taticalCellImageMap
    }

    function allTeamAddImageToPool(imgId: string) {
        console.debug('[TATICAL BOARD STORE] All team add image to pool', imgId)
        for (const teamIdString of Object.keys(teamTaticalBoardPanelMap)) {
            const teamId = Number(teamIdString)
            addImageToPool(teamId, imgId);
        }
    }

    function allTeamRemoveImageFromBoard(imgId: string) {
        console.debug('[TATICAL BOARD STORE] All team remove image from board', imgId)
        for (const teamIdString of Object.keys(teamTaticalBoardPanelMap)) {
            const teamId = Number(teamIdString)
            removeImageFromBoard(teamId, imgId)
        }
    }

    function allTeamReset() {
        console.debug('[TATICAL BOARD STORE] All team reset')
        for (const teamIdString of Object.keys(teamTaticalBoardPanelMap)) {
            const teamId = Number(teamIdString)
            reset(teamId)
        }
    }

    return {
        teamTaticalBoardPanelMap,
        displayPoolImageIds,
        initTeamTaticalBoardMap,
        addImageToPool,
        removeImageFromBoard,
        placeCellImage,
        removeCellImage,
        reset,
        setTaticalCellImageMap,
        allTeamAddImageToPool,
        allTeamRemoveImageFromBoard,
        allTeamReset
    }
})