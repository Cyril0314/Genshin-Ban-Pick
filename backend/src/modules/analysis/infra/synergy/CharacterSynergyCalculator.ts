// backend/src/modules/analysis/infra/synergy/CharacterSynergyCalculator.ts

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { ISynergyMatrix } from '@shared/contracts/analysis/ISynergyMatrix';
import type { IMatchTacticalUsageExpandedRefs } from '../../types/IMatchTacticalUsageExpandedRefs';

export default class CharacterSynergyCalculator {
    buildCooccurrenceGroups(usages: IMatchTacticalUsageExpandedRefs[], mode: SynergyMode): Record<string, string[]> {
        const groups: Record<string, string[]> = {};

        for (const u of usages) {
            const key = this.buildCooccurrenceGroupKey(u, mode);
            if (!groups[key]) groups[key] = [];
            groups[key].push(u.characterKey);
        }

        return groups;
    }

    buildSynergyMatrix(groups: Record<string, string[]>): ISynergyMatrix {
        const synergy: ISynergyMatrix = {};

        for (const characters of Object.values(groups)) {
            // 去重，避免同一 group 同一角色被算兩次
            const uniq = [...new Set(characters)];

            for (let i = 0; i < uniq.length; i++) {
                for (let j = i + 1; j < uniq.length; j++) {
                    const a = uniq[i];
                    const b = uniq[j];

                    synergy[a] ??= {};
                    synergy[b] ??= {};

                    synergy[a][b] = (synergy[a][b] || 0) + 1;
                    synergy[b][a] = (synergy[b][a] || 0) + 1;
                }
            }
        }

        return synergy;
    }

    private buildCooccurrenceGroupKey(rawTacticalUsage: IMatchTacticalUsageExpandedRefs, mode: SynergyMode): string {
        switch (mode) {
            case 'match':
                // 一場比賽當作一個 group
                return `${rawTacticalUsage.matchId}`;
            case 'team':
                // 同一個隊伍（整體）當作一個 group
                return `${rawTacticalUsage.teamId}`;
            case 'setup':
                // 一場比賽 + 一隊 + 一個編成（setup）當作一個 group
                return `${rawTacticalUsage.matchId}:${rawTacticalUsage.teamId}:${rawTacticalUsage.setupNumber}`;
        }
    }
}
