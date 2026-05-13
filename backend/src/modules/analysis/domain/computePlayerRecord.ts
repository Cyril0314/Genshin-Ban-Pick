// backend/src/modules/analysis/domain/computePlayerRecord.ts

import type {
    IPlayerCharacterFrequency,
    ICharacterSynergy,
    IPlayerRecord,
} from '@shared/contracts/analysis/IPlayerRecord';
import type { CharacterSynergyMatrix } from '@shared/contracts/analysis/CharacterSynergyMatrix';
import type { PlayerIdentity } from '@shared/contracts/player/PlayerIdentity';
import type { IMatchTacticalUsageWithCharacter } from '../types/IMatchTacticalUsageWithCharacter';

const TOP_CHARACTERS_COUNT = 10;
const TOP_SYNERGIES_COUNT = 3;

export function computePlayerRecord(
    playerRows: IMatchTacticalUsageWithCharacter[],
    synergyMatrix: CharacterSynergyMatrix,
    identity: PlayerIdentity,
    displayName: string,
): IPlayerRecord {
    // 一筆 row = 玩家在某 setup 用某角色（每玩家每 setup 只貢獻 1 角色）
    const totalSetups = playerRows.length;

    const characterCounts = new Map<string, number>();
    for (const r of playerRows) {
        characterCounts.set(r.characterKey, (characterCounts.get(r.characterKey) ?? 0) + 1);
    }

    const characterFrequency: IPlayerCharacterFrequency[] = Array.from(characterCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOP_CHARACTERS_COUNT)
        .map(([characterKey, count]) => ({
            characterKey,
            count,
            rate: totalSetups > 0 ? count / totalSetups : 0,
            topSynergies: pickTopSynergies(characterKey, synergyMatrix),
        }));

    return {
        identity,
        displayName,
        totalSetups,
        characterFrequency,
    };
}

/**
 * 從全域 synergy matrix 中查出角色 A 的 Top N 共現搭檔（只回 key + count）。
 */
function pickTopSynergies(characterKey: string, synergyMatrix: CharacterSynergyMatrix): ICharacterSynergy[] {
    const row = synergyMatrix[characterKey];
    if (!row) return [];
    const entries: ICharacterSynergy[] = [];
    for (const [partnerKey, count] of Object.entries(row)) {
        if (count === undefined) continue;
        entries.push({ characterKey: partnerKey, count });
    }
    return entries
        .sort((x, y) => y.count - x.count)
        .slice(0, TOP_SYNERGIES_COUNT);
}
