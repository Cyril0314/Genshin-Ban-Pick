import type { CharacterSynergyMatrix } from "./CharacterSynergyMatrix";

export interface ICharacterSynergy {
    characterKey: string;     // 與本角色共現的搭檔
    count: number;            // 該 partner 在全域 setup 中共現次數
}

export function pickTopSynergies(characterKey: string, synergyMatrix: CharacterSynergyMatrix, count: number): ICharacterSynergy[] {
    const row = synergyMatrix[characterKey];
    if (!row) return [];
    return Object.entries(row)
        .filter(([otherKey, count]) => otherKey !== characterKey && (count ?? 0) > 0)
        .map(([otherKey, count]) => ({ characterKey: otherKey, count: count as number }))
        .sort((x, y) => y.count - x.count)
        .slice(0, count);
}