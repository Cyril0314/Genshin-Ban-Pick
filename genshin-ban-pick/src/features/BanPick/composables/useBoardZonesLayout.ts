// src/features/BanPick/composables/useBoardZonesLayout.ts

import { computed } from "vue";

import { ZoneType } from "@/types/IZone";

import type { IRoomSetting } from "@/types/IRoomSetting";
import type { IZone } from "@/types/IZone";
import type { TeamMember } from '@/types/TeamMember';

export function useBoardZonesLayout(roomSetting: IRoomSetting, teamInfoPair: { left: { members: TeamMember[]; id: number; name: string; }; right: { name: string; members: TeamMember[]; id: number; } }) {
    const maxNumberOfPickPerColumn: number = 8
    const maxNumberOfUtilityPerRow: number = 6
    const maxNumberOfBanPerRow: number = 6

    const utilityZones = computed(() => {
        const utilityZones = Object.values(roomSetting.zoneMetaTable).filter(zone => zone.type === ZoneType.UTILITY).sort((a, b) => a.order - b.order)
        return utilityZones
    })

    const banZones = computed(() => {
        const banZones = Object.values(roomSetting.zoneMetaTable).filter(zone => zone.type === ZoneType.BAN)
        const { banPickSteps } = roomSetting

        const rows = Math.ceil(banZones.length / maxNumberOfBanPerRow);
        const zoneMatrix: IZone[][] = Array.from({ length: rows }, () => []);
        let row = 0;
        for (let i = 0; i < banZones.length; i++) {
            const zone = banZones[i]
            const step = banPickSteps.find(s => s.zoneId === zone.id)
            if (step?.teamId === teamInfoPair.left.id) {
                zoneMatrix[row].unshift(zone)
            } else {
                zoneMatrix[row].push(zone)
            }
            if ((i + 1) % maxNumberOfBanPerRow === 0) {
                row++;
            }
        }
        return zoneMatrix.flat()
    })

    function filterPickZonesByTeam(teamId: number) {
        const { banPickSteps } = roomSetting;

        return Object.values(roomSetting.zoneMetaTable)
            .filter(zone => zone.type === ZoneType.PICK)
            .map(zone => {
                const step = banPickSteps.find(s => s.zoneId === zone.id);
                return step ? { zone, stepIndex: step.index } : null;
            })
            .filter(item => item && banPickSteps[item.stepIndex].teamId === teamId)
            .sort((a, b) => a!.stepIndex - b!.stepIndex)
            .map(item => item!.zone);
    }

    const leftPickZones = computed(() => filterPickZonesByTeam(teamInfoPair.left.id));

    const rightPickZones = computed(() => filterPickZonesByTeam(teamInfoPair.right.id));

    return {
        utilityZones,
        banZones,
        leftPickZones,
        rightPickZones,
        maxNumberOfUtilityPerRow,
        maxNumberOfBanPerRow,
        maxNumberOfPickPerColumn,
    }
}