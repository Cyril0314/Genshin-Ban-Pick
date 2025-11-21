// src/modules/tactical/ui/composables/useTacticalPool.ts

import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useBoardImageStore, useMatchStepStore, ZoneType } from '@/modules/board';
import { useTeamInfoStore } from '@/modules/team';
import { useTacticalBoardStore } from '../../store/tacticalBoardStore';

export function useTacticalPool() {
    const boardStore = useBoardImageStore();
    const { zoneMetaTable, boardImageMap } = storeToRefs(boardStore);
    const matchStepStore = useMatchStepStore();
    const { matchSteps } = storeToRefs(matchStepStore);
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
                if (teamSlot != null) {
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

    const displayPoolImageIds = (teamSlot: number) =>
        computed(() => {
            const tacticalPool = tacticalPoolMap.value[teamSlot];
            if (!tacticalPool) return [];
            const used = new Set(Object.values(teamTacticalCellImageMap.value[teamSlot]));
            return tacticalPool.filter((id) => !used.has(id));
        });

    function findTeamSlot(zoneId: number) {
        const match = matchSteps.value.find((f) => f.zoneId === zoneId);
        return match?.teamSlot ?? null;
    }

    return { tacticalPoolMap, displayPoolImageIds };
}
