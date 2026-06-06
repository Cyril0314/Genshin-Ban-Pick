// backend/src/modules/analysis/domain/computePlayerStyleProfile.ts

import type { IPlayerStyleProfile } from '@shared/contracts/analysis/IPlayerStyleProfile';
import type { IMatchLineupSlotWithCharacter } from '../types/IMatchLineupSlotWithCharacter';
import type { ICharacter } from '@shared/contracts/character/ICharacter';
import { computeCharacterAttributeDistributions } from './computeCharacterAttributeDistributions';

export function computePlayerStyleProfile(
    playerSlots: IMatchLineupSlotWithCharacter[],
    globalSlots: IMatchLineupSlotWithCharacter[],
): IPlayerStyleProfile | undefined {
    const playerTotalPicks = playerSlots.length;

    if (playerTotalPicks === 0) { return undefined }

    const uniqueChars = new Set(playerSlots.map((m) => m.characterKey)).size;
    const versatility = Math.min((uniqueChars / 30) * 100, 100);

    const globalCharacterCounts = countBy(globalSlots, 'key');
    let globalTotalPicks = globalSlots.length;

    let totalMetaScore = 0;
    playerSlots.forEach((m) => {
        const count = globalCharacterCounts[m.characterKey] || 0;
        const rate = globalTotalPicks > 0 ? count / globalTotalPicks : 0;
        totalMetaScore += rate;
    });

    const maxPickCount = Math.max(...Object.values(globalCharacterCounts), 1);
    const maxPickRate = maxPickCount / globalTotalPicks;
    const avgPickRate = totalMetaScore / playerTotalPicks;
    const metaAffinity = maxPickRate > 0 ? (avgPickRate / maxPickRate) * 100 : 0;

    const playerDistributions = computeCharacterAttributeDistributions(playerSlots)
    const globalDistributions = computeCharacterAttributeDistributions(globalSlots)

    const roleAdjustedBias = computeGlobalAdjustedEntropy(playerDistributions.roleDistribution, globalDistributions.roleDistribution);
    const roleAdjustedDiversity = 100 - roleAdjustedBias

    const elementAdjustedBias = computeGlobalAdjustedEntropy(playerDistributions.elementDistribution, globalDistributions.elementDistribution);
    const elementAdjustedDiversity = 100 - elementAdjustedBias

    const weaponAdjustedBias = computeGlobalAdjustedEntropy(playerDistributions.weaponDistribution, globalDistributions.weaponDistribution);
    const weaponAdjustedDiversity = 100 - weaponAdjustedBias

    const modelTypeAdjustedBias = computeGlobalAdjustedEntropy(playerDistributions.modelTypeDistribution, globalDistributions.modelTypeDistribution);
    const modelTypeAdjustedDiversity = 100 - modelTypeAdjustedBias

    const regionAdjustedBias = computeGlobalAdjustedEntropy(playerDistributions.regionDistribution, globalDistributions.regionDistribution);
    const regionAdjustedDiversity = 100 - regionAdjustedBias

    const rarityAdjustedBias = computeGlobalAdjustedEntropy(playerDistributions.rarityDistribution, globalDistributions.rarityDistribution);
    const rarityAdjustedDiversity = 100 - rarityAdjustedBias

    return {
        versatility,
        metaAffinity,
        roleAdjustedDiversity,
        elementAdjustedDiversity,
        weaponAdjustedDiversity,
        modelTypeAdjustedDiversity,
        regionAdjustedDiversity,
        rarityAdjustedDiversity,
        characterAttributeDistributions: playerDistributions,
    };
}

function countBy<T extends keyof ICharacter>(slots: { character: ICharacter }[], field: T): Record<string, number> {
    const counts: Record<string, number> = {};

    slots.forEach((m) => {
        const value = m.character[field];
        const key = value instanceof Date ? value.toISOString() : String(value);
        counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
}

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
