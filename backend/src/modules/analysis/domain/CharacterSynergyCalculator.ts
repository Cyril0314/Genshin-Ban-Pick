// backend/src/modules/analysis/domain/CharacterSynergyCalculator.ts

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { IMatchLineupSlotExpandedRefs } from '../types/IMatchLineupSlotExpandedRefs';
import type { CharacterSynergyMatrix } from '@shared/contracts/analysis/CharacterSynergyMatrix';

export default class CharacterSynergyCalculator {
    buildSynergyMatrix(groups: Record<string, string[]>): CharacterSynergyMatrix {
        const synergyMatrix: CharacterSynergyMatrix = {};

        for (const characters of Object.values(groups)) {
            // 去重，避免同一 group 同一角色被算兩次
            const uniq = [...new Set(characters)];

            for (let i = 0; i < uniq.length; i++) {
                for (let j = i + 1; j < uniq.length; j++) {
                    const a = uniq[i];
                    const b = uniq[j];

                    synergyMatrix[a] ??= {};
                    synergyMatrix[b] ??= {};
                    synergyMatrix[a][b] = (synergyMatrix[a][b] || 0) + 1;
                    synergyMatrix[b][a] = (synergyMatrix[b][a] || 0) + 1;
                }
            }
        }

        return synergyMatrix;
    }

    buildCooccurrenceGroups(usages: IMatchLineupSlotExpandedRefs[], mode: SynergyMode): Record<string, string[]> {
        const groups: Record<string, string[]> = {};

        for (const u of usages) {
            const key = this.buildCooccurrenceGroupKey(u, mode);
            if (!groups[key]) groups[key] = [];
            groups[key].push(u.characterKey);
        }

        return groups;
    }


    private buildCooccurrenceGroupKey(rawLineupSlot: IMatchLineupSlotExpandedRefs, mode: SynergyMode): string {
        switch (mode) {
            case 'match':
                // 一場比賽當作一個 group
                return `${rawLineupSlot.matchId}`;
            case 'team':
                // 同一個隊伍（整體）當作一個 group
                return `${rawLineupSlot.teamId}`;
            case 'setup':
                // 一場比賽 + 一隊 + 一個編成（setup）當作一個 group
                return `${rawLineupSlot.matchId}:${rawLineupSlot.teamId}:${rawLineupSlot.setupNumber}`;
        }
    }
}
