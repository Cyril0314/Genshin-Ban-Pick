// backend/src/modules/analysis/infra/matrix/SquareSimilarityMatrixBuilder.ts

import type { KeyIndexedMatrix } from '@shared/contracts/analysis/KeyIndexedMatrix';

export default class SquareSimilarityMatrixBuilder {
    constructor() {}

    build<RowKey extends string>(
        raw: KeyIndexedMatrix<RowKey, RowKey, number>,
        mode: 'jaccard' | 'ochiai' | 'overlap',
        nodeWeights: Record<RowKey, number>,
    ): KeyIndexedMatrix<RowKey, RowKey, number> {
        return this.computeAssociationStrengthMatrix(raw, nodeWeights, mode);
    }

    private computeAssociationStrengthMatrix<RowKey extends string>(
        raw: KeyIndexedMatrix<RowKey, RowKey, number>,
        nodeWeights: Record<RowKey, number>,
        mode: 'jaccard' | 'ochiai' | 'overlap',
    ): KeyIndexedMatrix<RowKey, RowKey, number> {
        const result: KeyIndexedMatrix<RowKey, RowKey, number> = {} as KeyIndexedMatrix<RowKey, RowKey, number>;
        const rowKeys = Object.keys(raw) as RowKey[];

        for (const a of rowKeys) {
            result[a] ??= {} as Record<RowKey, number>;
            const countA = nodeWeights[a] || 0;

            for (const b of rowKeys) {
                if (a === b) {
                    result[a][b] = 1; // Self-similarity is 1
                    continue;
                }
                const w = raw[a]?.[b] ?? 0;
                const countB = nodeWeights[b] || 0;

                if (w === 0) {
                    result[a][b] = 0;
                    continue;
                }

                let strength = 0;
                if (mode === 'jaccard') {
                    // 嚴格共現
                    // Jaccard = |A ∩ B| / |A ∪ B| = w / (distA + distB - w)
                    const denom = countA + countB - w;
                    strength = denom > 0 ? w / denom : 0;
                } else if (mode === 'ochiai') {
                    // 相關性共現
                    // Ochiai = |A ∩ B| / sqrt(|A| * |B|)
                    const denom = Math.sqrt(countA * countB);
                    strength = denom > 0 ? w / denom : 0;
                } else if (mode === 'overlap') {
                    // 依附性共現
                    // Overlap = |A ∩ B| / min(|A|, |B|)
                    const denom = Math.min(countA, countB);
                    strength = denom > 0 ? w / denom : 0;
                }
                result[a][b] = strength;
            }
        }
        return result;
    }

}
