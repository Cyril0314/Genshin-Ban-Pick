// src/stores/taticalBoardStore.ts

import { computed, reactive, ref, shallowRef, watch } from "vue";
import { defineStore } from "pinia";

import type { ITeam } from "@/types/ITeam";

export type TacticalCellImageMap = Record<number, string>

export const useTaticalBoardStore = defineStore('taticalBoard', () => {
    const teamTaticalBoardPanelMap: Record<number, {
        poolImageIds: string[];
        cellImageMap: TacticalCellImageMap;
    }> = reactive({});

    const numberOfTeamSetup = shallowRef(0)
    const numberOfSetupCharacter = shallowRef(0)

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


    function initTeamTaticalBoardMap(teams: ITeam[], newNumberOfTeamSetup: number, newNumberOfSetupCharacter: number) {
        console.debug('[TATICAL BOARD STORE] Init team tatical board panel map', teams)
        for (const team of teams) {
            teamTaticalBoardPanelMap[team.id] = {
                poolImageIds: [],
                cellImageMap: {}
            };
        }
        numberOfTeamSetup.value = newNumberOfTeamSetup
        numberOfSetupCharacter.value = newNumberOfSetupCharacter
    }

    function addImageToPool(teamId: number, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Add image to pool', teamId, imgId)
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return;
        if (!taticalBoardPanel.poolImageIds.includes(imgId)) {
            taticalBoardPanel.poolImageIds.push(imgId)
        }
    }

    function removeImageFromPool(teamId: number, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Remove image from pool', teamId, imgId)
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return;
        const index = taticalBoardPanel.poolImageIds.indexOf(imgId)
        if (index !== -1) {
            taticalBoardPanel.poolImageIds.splice(index, 1)
        }
    }

    function placeCellImage(teamId: number, cellId: number, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Place cell image', teamId, cellId, imgId)
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return;
        taticalBoardPanel.cellImageMap[cellId] = imgId
    }

    function removeCellImage(teamId: number, cellId: number) {
        console.debug('[TATICAL BOARD STORE] Remove cell image', teamId, cellId)
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return;
        delete taticalBoardPanel.cellImageMap[cellId]
    }

    function resetBoard(teamId: number) {
        console.debug('[TATICAL BOARD STORE] Reset board', teamId)
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

    function findCellIdByImageId(teamId: number, imgId: string): number | null {
        const taticalBoardPanel = teamTaticalBoardPanelMap[teamId];
        if (!taticalBoardPanel) return null;
        const value = Object.entries(taticalBoardPanel.cellImageMap).find(([, f]) => f === imgId)
        if (!value) {
            console.debug('[TATICAL BOARD STORE] Cannot find cell id by image id', imgId)
            return null
        }
        console.debug('[TATICAL BOARD STORE] Find cell id by image id', value[0], imgId)
        return Number(value[0])
    }

    return {
        teamTaticalBoardPanelMap,
        numberOfTeamSetup,
        numberOfSetupCharacter,
        displayPoolImageIds,
        initTeamTaticalBoardMap,
        addImageToPool,
        removeImageFromPool,
        placeCellImage,
        removeCellImage,
        resetBoard,
        setTaticalCellImageMap,
        findCellIdByImageId,
    }
})