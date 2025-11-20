// src/features/BanPick/composables/useBoardZonesLayout.ts

import { computed } from "vue";

import { ZoneType } from "../../types/IZone";

import type { IRoomSetting } from "@/modules/room";
import type { TeamMember } from '@/modules/team';
import type { IZone } from "../../types/IZone";

export function useBoardZonesLayout(roomSetting: IRoomSetting, teamInfoPair: { left: { name: string; members: Record<number, TeamMember>; slot: number; }; right: { name: string; members: Record<number, TeamMember>; slot: number; } }) {
    const maxNumberOfPickPerColumn: number = 8
    const maxNumberOfUtilityPerRow: number = 8
    const maxNumberOfBanPerRow: number = 6

    const utilityZones = computed(() => {
        const utilityZones = Object.values(roomSetting.zoneMetaTable).filter(zone => zone.type === ZoneType.Utility)
        const { matchFlow } = roomSetting

        const rows = Math.ceil(utilityZones.length / maxNumberOfUtilityPerRow);
        const zoneMatrix: IZone[][] = Array.from({ length: rows }, () => []);
        let row = 0;
        for (let i = 0; i < utilityZones.length; i++) {
            const zone = utilityZones[i]
            // const step = matchFlow.steps.find(s => s.zoneId === zone.id)
            // if (step?.teamSlot === teamInfoPair.left.slot) {
            //     zoneMatrix[row].unshift(zone)
            // } else {
                zoneMatrix[row].push(zone)
            // }
            // if ((i + 1) % maxNumberOfUtilityPerRow === 0) {
            //     row++;
            // }
        }

        return zoneMatrix.flat()
    })

    const banZones = computed(() => {
        const banZones = Object.values(roomSetting.zoneMetaTable).filter(zone => zone.type === ZoneType.Ban)
        const { matchFlow } = roomSetting

        const rows = Math.ceil(banZones.length / maxNumberOfBanPerRow);
        const zoneMatrix: IZone[][] = Array.from({ length: rows }, () => []);
        let row = 0;
        for (let i = 0; i < banZones.length; i++) {
            const zone = banZones[i]
            const step = matchFlow.steps.find(s => s.zoneId === zone.id)
            if (step?.teamSlot === teamInfoPair.left.slot) {
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

    function filterPickZonesByTeam(teamSlot: number) {
        const { matchFlow } = roomSetting;

        return Object.values(roomSetting.zoneMetaTable)
            .filter(zone => zone.type === ZoneType.Pick)
            .map(zone => {
                const step = matchFlow.steps.find(s => s.zoneId === zone.id);
                return step ? { zone, stepIndex: step.index } : null;
            })
            .filter(item => item && matchFlow.steps[item.stepIndex].teamSlot === teamSlot)
            .sort((a, b) => a!.stepIndex - b!.stepIndex)
            .map(item => item!.zone);
    }

    const leftPickZones = computed(() => filterPickZonesByTeam(teamInfoPair.left.slot));

    const rightPickZones = computed(() => filterPickZonesByTeam(teamInfoPair.right.slot));

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