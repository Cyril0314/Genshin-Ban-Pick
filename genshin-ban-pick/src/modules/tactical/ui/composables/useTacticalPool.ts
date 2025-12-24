// src/modules/tactical/ui/composables/useTacticalPool.ts

import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useBoardStore } from '@/modules/board';
import { useTeamInfoStore } from '@/modules/team';
import { useTacticalBoardStore } from '../../store/tacticalBoardStore';
import { ZoneType } from '@shared/contracts/board/value-types';

export function useTacticalPool() {
    const boardStore = useBoardStore();
    const { zoneMetaTable, boardImageMap, matchSteps } = storeToRefs(boardStore);
    const teamInfoStore = useTeamInfoStore();
    const { teams } = storeToRefs(teamInfoStore);
    const tacticalBoardStore = useTacticalBoardStore();
    const { teamTacticalCellImageMap } = storeToRefs(tacticalBoardStore);

    const tacticalPoolMap = computed(() => {
        const tacticalPoolMap: Record<number, Array<string>> = {};

        for (const [zoneId, imgId] of Object.entries(boardImageMap.value)) {
            const zone = zoneMetaTable.value[Number(zoneId)];
            if (zone.type === ZoneType.Pick) {
                const teamSlot = findTeamSlot(Number(zoneId));
                if (teamSlot != undefined) {
                    if (!tacticalPoolMap[teamSlot]) {
                        tacticalPoolMap[teamSlot] = [];
                    }
                    tacticalPoolMap[teamSlot].push(imgId);
                }
            }
            if (zone.type === ZoneType.Utility) {
                for (const team of teams.value) {
                    if (!tacticalPoolMap[team.slot]) {
                        tacticalPoolMap[team.slot] = [];
                    }
                    tacticalPoolMap[team.slot].push(imgId);
                }
            }
        }

        return tacticalPoolMap;
    });

    const displayPoolImageIdsMap = computed(() => {
        const result: Record<number, string[]> = {};
        for (const teamSlot in tacticalPoolMap.value) {
            const slot = Number(teamSlot);
            const tacticalPool = tacticalPoolMap.value[slot];
            if (!tacticalPool) {
                result[slot] = [];
                continue;
            }

            const used = new Set(Object.values(teamTacticalCellImageMap.value[slot]));
            result[slot] = tacticalPool.filter((id) => !used.has(id));
        }
        return result;
    });

    function findTeamSlot(zoneId: number) {
        const match = matchSteps.value.find((f) => f.zoneId === zoneId);
        return match?.teamSlot ?? undefined;
    }

    return { tacticalPoolMap, displayPoolImageIdsMap };
}
