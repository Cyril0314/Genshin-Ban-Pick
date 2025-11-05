// src/stores/tacticalBoardStore.ts

import { computed, reactive, ref, shallowRef, watch } from "vue";
import { defineStore } from "pinia";

import type { ITeam } from "@/types/ITeam";

export type TacticalCellImageMap = Record<number, string>

export const useTacticalBoardStore = defineStore('tacticalBoard', () => {
    const teamTacticalBoardPanelMap: Record<number, {
        poolImageIds: string[];
        cellImageMap: TacticalCellImageMap;
    }> = reactive({});

    const numberOfTeamSetup = shallowRef(0)
    const numberOfSetupCharacter = shallowRef(0)

    const displayPoolImageIds = (teamId: number) => computed(() => {
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamId];
        if (!tacticalBoardPanel) return [];
        const used = new Set(Object.values(tacticalBoardPanel.cellImageMap));
        return tacticalBoardPanel.poolImageIds.filter(id => !used.has(id));
    });

    watch(teamTacticalBoardPanelMap, (teamTacticalBoardPanelMap) => {
        console.debug('[TATICAL BOARD STORE] Watch team tactical board panel map', teamTacticalBoardPanelMap)
        // console.table(
        //     Object.entries(teamTacticalBoardPanelMap).map(([id, panel]) => ({
        //         teamId: id,
        //         hasPool: !!panel?.poolImageIds,
        //         hasMap: !!panel?.cellImageMap,
        //     }))
        // )
    }, { deep: true, immediate: true })


    function initTeamTacticalBoardMap(teams: ITeam[], newNumberOfTeamSetup: number, newNumberOfSetupCharacter: number) {
        console.debug('[TATICAL BOARD STORE] Init team tactical board panel map', teams)
        for (const team of teams) {
            teamTacticalBoardPanelMap[team.id] = {
                poolImageIds: [],
                cellImageMap: {}
            };
        }
        numberOfTeamSetup.value = newNumberOfTeamSetup
        numberOfSetupCharacter.value = newNumberOfSetupCharacter
    }

    function addImageToPool(teamId: number, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Add image to pool', teamId, imgId)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamId];
        if (!tacticalBoardPanel) return;
        if (!tacticalBoardPanel.poolImageIds.includes(imgId)) {
            tacticalBoardPanel.poolImageIds.push(imgId)
        }
    }

    function removeImageFromPool(teamId: number, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Remove image from pool', teamId, imgId)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamId];
        if (!tacticalBoardPanel) return;
        const index = tacticalBoardPanel.poolImageIds.indexOf(imgId)
        if (index !== -1) {
            tacticalBoardPanel.poolImageIds.splice(index, 1)
        }
    }

    function placeCellImage(teamId: number, cellId: number, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Place cell image', teamId, cellId, imgId)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamId];
        if (!tacticalBoardPanel) return;
        tacticalBoardPanel.cellImageMap[cellId] = imgId
    }

    function removeCellImage(teamId: number, cellId: number) {
        console.debug('[TATICAL BOARD STORE] Remove cell image', teamId, cellId)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamId];
        if (!tacticalBoardPanel) return;
        delete tacticalBoardPanel.cellImageMap[cellId]
    }

    function resetBoard(teamId: number) {
        console.debug('[TATICAL BOARD STORE] Reset board', teamId)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamId];
        if (!tacticalBoardPanel) return;
        tacticalBoardPanel.poolImageIds = []
        tacticalBoardPanel.cellImageMap = {}
    }

    function setTacticalCellImageMap(teamId: number, tacticalCellImageMap: TacticalCellImageMap) {
        console.debug('[TATICAL BOARD STORE] Set tactical cell image map', teamId, tacticalCellImageMap)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamId];
        if (!tacticalBoardPanel) return;
        tacticalBoardPanel.cellImageMap = tacticalCellImageMap
    }

    function findCellIdByImageId(teamId: number, imgId: string): number | null {
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamId];
        if (!tacticalBoardPanel) return null;
        const value = Object.entries(tacticalBoardPanel.cellImageMap).find(([, f]) => f === imgId)
        if (!value) {
            console.debug('[TATICAL BOARD STORE] Cannot find cell id by image id', imgId)
            return null
        }
        console.debug('[TATICAL BOARD STORE] Find cell id by image id', value[0], imgId)
        return Number(value[0])
    }

    return {
        teamTacticalBoardPanelMap,
        numberOfTeamSetup,
        numberOfSetupCharacter,
        displayPoolImageIds,
        initTeamTacticalBoardMap,
        addImageToPool,
        removeImageFromPool,
        placeCellImage,
        removeCellImage,
        resetBoard,
        setTacticalCellImageMap,
        findCellIdByImageId,
    }
})