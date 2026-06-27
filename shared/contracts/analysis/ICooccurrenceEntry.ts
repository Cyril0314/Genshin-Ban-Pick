import type { KeyIndexedMatrix } from './KeyIndexedMatrix';

export interface ICooccurrenceEntry {
    key: string;
    count: number;
}

export function pickTopCooccurrenceEntries(key: string, cooccurrenceMatrix: KeyIndexedMatrix<string, string>, count: number): ICooccurrenceEntry[] {
    const row = cooccurrenceMatrix[key];
    if (!row) return [];
    return Object.entries(row)
        .filter(([otherKey, count]) => otherKey !== key && (count ?? 0) > 0)
        .map(([otherKey, count]) => ({ key: otherKey, count: count as number }))
        .sort((x, y) => y.count - x.count)
        .slice(0, count);
}
