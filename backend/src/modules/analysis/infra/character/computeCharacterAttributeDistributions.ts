import type { ICharacterAttributeDistributions } from "@shared/contracts/analysis/character/ICharacterAttributeDistributions";
import type { ICharacter } from "@shared/contracts/character/ICharacter";
import type { IMatchTacticalUsageWithCharacter } from "../../types/IMatchTacticalUsageWithCharacter";

export function computeCharacterAttributeDistributions(usages: IMatchTacticalUsageWithCharacter[]): ICharacterAttributeDistributions {
    const roleDistribution = countBy(usages, 'role');
    const elementDistribution = countBy(usages, 'element');
    const weaponDistribution = countBy(usages, 'weapon');
    const modelTypeDistribution = countBy(usages, 'modelType');
    const regionDistribution = countBy(usages, 'region');
    const rarityDistribution = countBy(usages, 'rarity');

    return {
        roleDistribution,
        elementDistribution,
        weaponDistribution,
        modelTypeDistribution,
        regionDistribution,
        rarityDistribution
    }
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
