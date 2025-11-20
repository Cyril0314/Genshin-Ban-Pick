// src/modules/tactical/store/tacticalBoardStore.ts

import { computed, reactive, ref, shallowRef, watch } from "vue";
import { defineStore } from "pinia";

import type { ITeam } from "@/modules/team";
import type { TacticalCellImageMap } from "../types/TacticalCellImageMap";

export const useTacticalBoardStore = defineStore('tacticalBoard', () => {
    const teamTacticalBoardPanelMap: Record<number, {
        poolImageIds: string[];
        cellImageMap: TacticalCellImageMap;
    }> = reactive({});

    const numberOfTeamSetup = shallowRef(0)
    const numberOfSetupCharacter = shallowRef(0)

    const displayPoolImageIds = (teamSlot: number) => computed(() => {
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamSlot];
        if (!tacticalBoardPanel) return [];
        const used = new Set(Object.values(tacticalBoardPanel.cellImageMap));
        return tacticalBoardPanel.poolImageIds.filter(id => !used.has(id));
    });

    watch(teamTacticalBoardPanelMap, (teamTacticalBoardPanelMap) => {
        console.debug('[TATICAL BOARD STORE] Watch team tactical board panel map', teamTacticalBoardPanelMap)
        // console.table(
        //     Object.entries(teamTacticalBoardPanelMap).map(([id, panel]) => ({
        //         teamSlot: id,
        //         hasPool: !!panel?.poolImageIds,
        //         hasMap: !!panel?.cellImageMap,
        //     }))
        // )
    }, { deep: true, immediate: true })


    function initTeamTacticalBoardMap(teams: ITeam[], newNumberOfTeamSetup: number, newNumberOfSetupCharacter: number) {
        console.debug('[TATICAL BOARD STORE] Init team tactical board panel map', teams)
        for (const team of teams) {
            teamTacticalBoardPanelMap[team.slot] = {
                poolImageIds: [],
                cellImageMap: {}
            };
        }
        numberOfTeamSetup.value = newNumberOfTeamSetup
        numberOfSetupCharacter.value = newNumberOfSetupCharacter
    }

    function addImageToPool(teamSlot: number, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Add image to pool', teamSlot, imgId)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamSlot];
        if (!tacticalBoardPanel) return;
        if (!tacticalBoardPanel.poolImageIds.includes(imgId)) {
            tacticalBoardPanel.poolImageIds.push(imgId)
        }
    }

    function removeImageFromPool(teamSlot: number, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Remove image from pool', teamSlot, imgId)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamSlot];
        if (!tacticalBoardPanel) return;
        const index = tacticalBoardPanel.poolImageIds.indexOf(imgId)
        if (index !== -1) {
            tacticalBoardPanel.poolImageIds.splice(index, 1)
        }
    }

    function placeCellImage(teamSlot: number, cellId: number, imgId: string) {
        console.debug('[TATICAL BOARD STORE] Place cell image', teamSlot, cellId, imgId)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamSlot];
        if (!tacticalBoardPanel) return;
        tacticalBoardPanel.cellImageMap[cellId] = imgId
    }

    function removeCellImage(teamSlot: number, cellId: number) {
        console.debug('[TATICAL BOARD STORE] Remove cell image', teamSlot, cellId)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamSlot];
        if (!tacticalBoardPanel) return;
        delete tacticalBoardPanel.cellImageMap[cellId]
    }

    function resetBoard(teamSlot: number) {
        console.debug('[TATICAL BOARD STORE] Reset board', teamSlot)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamSlot];
        if (!tacticalBoardPanel) return;
        tacticalBoardPanel.poolImageIds = []
        tacticalBoardPanel.cellImageMap = {}
    }

    function setTacticalCellImageMap(teamSlot: number, tacticalCellImageMap: TacticalCellImageMap) {
        console.debug('[TATICAL BOARD STORE] Set tactical cell image map', teamSlot, tacticalCellImageMap)
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamSlot];
        if (!tacticalBoardPanel) return;
        tacticalBoardPanel.cellImageMap = tacticalCellImageMap
    }

    function findCellIdByImageId(teamSlot: number, imgId: string): number | null {
        const tacticalBoardPanel = teamTacticalBoardPanelMap[teamSlot];
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