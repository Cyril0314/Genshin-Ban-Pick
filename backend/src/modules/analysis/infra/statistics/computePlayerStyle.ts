// backend/src/modules/analysis/infra/statistics/computePlayerStyle.ts

import { Element, Weapon } from '@shared/contracts/character/value-types';

import type { IPlayerStyleStats } from '@shared/contracts/analysis/IPlayerStyleStats';
import type { IMatchTacticalUsageWithCharacter } from '../../types/IMatchTacticalUsageWithCharacter';
import type { ICharacter } from '@shared/contracts/character/ICharacter';

export function computeGlobalBaseline(allUsuages: IMatchTacticalUsageWithCharacter[]) {
    const total = allUsuages.length;

    const elementCounts = countBy(allUsuages, 'element');
    console.log(`elementCounts`, elementCounts);

    const weaponCounts = countBy(allUsuages, 'weapon');
    console.log(`weaponCounts`, weaponCounts);

    const regionCounts = countBy(allUsuages, 'region');
    console.log(`regionCounts`, regionCounts);

    const rarityCounts = countBy(allUsuages, 'rarity');
    console.log(`rarityCounts`, rarityCounts);

    const modelTypeCounts = countBy(allUsuages, 'modelType');
    console.log(`modelTypeCounts`, modelTypeCounts);

    const roleCounts = countBy(allUsuages, 'role');
    console.log(`roleCounts`, roleCounts);
}

export function computePlayerStyle(
    memberUsages: IMatchTacticalUsageWithCharacter[],
    globalUsages: IMatchTacticalUsageWithCharacter[],
): IPlayerStyleStats | null {
    const playerTotalPicks = memberUsages.length;

    if (playerTotalPicks === 0) { return null }

    const uniqueChars = new Set(memberUsages.map((m) => m.characterKey)).size;
    const versatility = Math.min((uniqueChars / 30) * 100, 100);

    const globalCharacterCounts = countBy(globalUsages, 'key');
    let globalTotalPicks = globalUsages.length;

    let totalMetaScore = 0;
    memberUsages.forEach((m) => {
        const count = globalCharacterCounts[m.characterKey] || 0;
        const rate = globalTotalPicks > 0 ? count / globalTotalPicks : 0;
        totalMetaScore += rate;
    });

    const maxPickCount = Math.max(...Object.values(globalCharacterCounts), 1);
    const maxPickRate = maxPickCount / globalTotalPicks;
    const avgPickRate = totalMetaScore / playerTotalPicks;
    const metaAffinity = maxPickRate > 0 ? (avgPickRate / maxPickRate) * 100 : 0;

    const playerRoleCounts = countBy(memberUsages, 'role');
    const playerElementCounts = countBy(memberUsages, 'element');
    const playerWeaponCounts = countBy(memberUsages, 'weapon');
    const playerModelTypeCounts = countBy(memberUsages, 'modelType');
    const playerRegionCounts = countBy(memberUsages, 'region');
    const playerRarityCounts = countBy(memberUsages, 'rarity');

    const globalRoleCounts = countBy(globalUsages, 'role');
    const globalElementCounts = countBy(globalUsages, 'element');
    const globalWeaponCounts = countBy(globalUsages, 'weapon');
    const globalModelTypeCounts = countBy(globalUsages, 'modelType');
    const globalRegionCounts = countBy(globalUsages, 'region');
    const globalRarityCounts = countBy(globalUsages, 'rarity');

    const roleAdjustedBias = computeGlobalAdjustedEntropy(playerRoleCounts, globalRoleCounts);
    const roleAdjustedDiversity = 100 - roleAdjustedBias

    const elementAdjustedBias = computeGlobalAdjustedEntropy(playerElementCounts, globalElementCounts);
    const elementAdjustedDiversity = 100 - elementAdjustedBias

    const weaponAdjustedBias = computeGlobalAdjustedEntropy(playerWeaponCounts, globalWeaponCounts);
    const weaponAdjustedDiversity = 100 - weaponAdjustedBias

    const modelTypeAdjustedBias = computeGlobalAdjustedEntropy(playerModelTypeCounts, globalModelTypeCounts);
    const modelTypeAdjustedDiversity = 100 - modelTypeAdjustedBias

    const regionAdjustedBias = computeGlobalAdjustedEntropy(playerRegionCounts, globalRegionCounts);
    const regionAdjustedDiversity = 100 - regionAdjustedBias

    const rarityAdjustedBias = computeGlobalAdjustedEntropy(playerRarityCounts, globalRarityCounts);
    const rarityAdjustedDiversity = 100 - rarityAdjustedBias

    console.log(`elementAdjustedBias`, elementAdjustedBias)
    console.log(`weaponAdjustedBias`, weaponAdjustedBias)

    // const rarityCounts = countBy(memberUsages, "rarity")
    // console.log(`rarityCounts`, rarityCounts)

    return {
        versatility,
        metaAffinity,
        roleAdjustedDiversity,
        elementAdjustedDiversity,
        weaponAdjustedDiversity,
        modelTypeAdjustedDiversity,
        regionAdjustedDiversity,
        rarityAdjustedDiversity,
        playerRoleCounts,
        playerElementCounts,
        playerWeaponCounts,
        playerModelTypeCounts,
        playerRegionCounts,
        playerRarityCounts,
    };
}

function countBy<T extends keyof ICharacter>(usages: { character: ICharacter }[], field: T): Record<string, number> {
    const counts: Record<string, number> = {};

    usages.forEach((m) => {
        const value = m.character[field];
        const key = value instanceof Date ? value.toISOString() : String(value);
        counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
}

// function computeEntropy(counts: Record<string, number>, total: number): number {
//     let entropy = 0;

//     Object.values(counts).forEach((count) => {
//         const p = count / total;
//         entropy -= p * Math.log2(p);
//     });

//     return entropy;
// }

function computeEntropy(distribution: number[]): number {
    return distribution.reduce((acc, p) => {
        if (p <= 0) return acc;
        return acc - p * Math.log2(p);
    }, 0);
}

function normalize(values: number[]): number[] {
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum === 0) return values.map(() => 0);
    return values.map((v) => v / sum);
}

export function computeGlobalAdjustedEntropy(playerCounts: Record<string, number>, globalCounts: Record<string, number>): number {
    const categories = Object.keys(globalCounts);
    const playerTotal = Object.values(playerCounts).reduce((a, b) => a + b, 0);
    const globalTotal = Object.values(globalCounts).reduce((a, b) => a + b, 0);

    // Step 1: playerP & globalP
    const playerP = categories.map((c) => (playerCounts[c] || 0) / playerTotal);
    const globalP = categories.map((c) => (globalCounts[c] || 0) / globalTotal);

    // Step 2: adjusted = playerP / globalP
    const adjusted = playerP.map((p, i) => (globalP[i] > 0 ? p / globalP[i] : 0));

    // Step 3: normalize adjusted → adjusted distribution
    const adjustedNorm = normalize(adjusted);

    // Step 4: entropy(adjustedNorm)
    const entropy = computeEntropy(adjustedNorm);

    // Step 5: max entropy
    const maxEntropy = Math.log2(categories.length);

    // Step 6: bias (0 = 無偏好 / 100 = 極度偏好)
    if (maxEntropy <= 0) return 0;

    const bias = (1 - entropy / maxEntropy) * 100;
    return bias;
}
