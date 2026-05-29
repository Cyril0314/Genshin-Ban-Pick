// src/modules/lineup/ui/composables/useLineupPool.ts

import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import { useBoardStore } from '@/modules/board';
import { useTeamInfoStore } from '@/modules/team';
import { useLineupStore } from '../../store/lineupStore';
import { ZoneType } from '@shared/contracts/board/value-types';

export function useLineupPool() {
    const boardStore = useBoardStore();
    const { zoneMetaTable, boardImageMap, matchSteps } = storeToRefs(boardStore);
    const teamInfoStore = useTeamInfoStore();
    const { teams } = storeToRefs(teamInfoStore);
    const lineupStore = useLineupStore();
    const { teamLineupImageMap } = storeToRefs(lineupStore);

    const lineupPoolMap = computed(() => {
        const lineupPoolMap: Record<number, Array<string>> = {};

        for (const [zoneId, imgId] of Object.entries(boardImageMap.value)) {
            const zone = zoneMetaTable.value[Number(zoneId)];
            if (zone.type === ZoneType.Pick) {
                const teamSlot = findTeamSlot(Number(zoneId));
                if (teamSlot != undefined) {
                    if (!lineupPoolMap[teamSlot]) {
                        lineupPoolMap[teamSlot] = [];
                    }
                    lineupPoolMap[teamSlot].push(imgId);
                }
            }
            if (zone.type === ZoneType.Utility) {
                for (const team of teams.value) {
                    if (!lineupPoolMap[team.slot]) {
                        lineupPoolMap[team.slot] = [];
                    }
                    lineupPoolMap[team.slot].push(imgId);
                }
            }
        }

        return lineupPoolMap;
    });

    const displayPoolImageIdsMap = computed(() => {
        const result: Record<number, string[]> = {};
        for (const teamSlot in lineupPoolMap.value) {
            const slot = Number(teamSlot);
            const lineupPool = lineupPoolMap.value[slot];
            if (!lineupPool) {
                result[slot] = [];
                continue;
            }

            const used = new Set(Object.values(teamLineupImageMap.value[slot]));
            result[slot] = lineupPool.filter((id) => !used.has(id));
        }
        return result;
    });

    function findTeamSlot(zoneId: number) {
        const match = matchSteps.value.find((f) => f.zoneId === zoneId);
        return match?.teamSlot ?? undefined;
    }

    return { lineupPoolMap, displayPoolImageIdsMap };
}
