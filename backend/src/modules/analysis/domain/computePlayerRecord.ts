// backend/src/modules/analysis/domain/computePlayerRecord.ts

import { countCharacterKeys } from './countCharacterKeys';

import { pickTopSynergies } from '@shared/contracts/analysis/ICharacterSynergy';
import type { IPlayerCharacterFrequency, IPlayerRecord } from '@shared/contracts/analysis/IPlayerRecord';
import type { CharacterSynergyMatrix } from '@shared/contracts/analysis/CharacterSynergyMatrix';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

const TOP_CHARACTER_COUNT = 10;
const TOP_SYNERGY_COUNT = 3;

export function computePlayerRecord(
    playerRows: { characterKey: string }[],
    synergyMatrix: CharacterSynergyMatrix,
    teamMember: TeamMember,
): IPlayerRecord {
    // 一筆 row = 玩家在某 setup 用某角色（每玩家每 setup 只貢獻 1 角色）
    const totalSetups = playerRows.length;

    const characterCounts = countCharacterKeys(playerRows);

    const characterFrequency: IPlayerCharacterFrequency[] = Object.entries(characterCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOP_CHARACTER_COUNT)
        .map(([characterKey, count]) => ({
            characterKey,
            count,
            rate: totalSetups > 0 ? count / totalSetups : 0,
            topSynergies: pickTopSynergies(characterKey, synergyMatrix, TOP_SYNERGY_COUNT),
        }));

    return {
        teamMember,
        totalSetups,
        characterFrequency,
    };
}
