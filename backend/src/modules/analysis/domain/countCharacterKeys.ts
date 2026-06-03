// backend/src/modules/analysis/domain/countCharacterKeys.ts

export function countCharacterKeys(slots: { characterKey: string }[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const slot of slots) {
        counts[slot.characterKey] = (counts[slot.characterKey] ?? 0) + 1;
    }
    return counts;
}
