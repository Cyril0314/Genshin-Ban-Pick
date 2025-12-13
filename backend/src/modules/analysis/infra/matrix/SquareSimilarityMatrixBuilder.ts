// backend/src/modules/analysis/infra/matrix/SquareSimilarityMatrixBuilder.ts

import type { KeyIndexedMatrix } from '@shared/contracts/analysis/KeyIndexedMatrix';

export default class SquareSimilarityMatrixBuilder {
    constructor() {}

    build<RowKey extends string>(
        raw: KeyIndexedMatrix<RowKey, RowKey, number>,
        mode: 'jaccard' | 'cosine' = 'jaccard',
    ): KeyIndexedMatrix<RowKey, RowKey, number> {
        // console.log(`raw`, JSON.stringify(raw))
        return mode === 'jaccard' ? this.computeJaccardSimilarityMatrix(raw) : this.computeCosineSimilarityMatrix(raw);
    }

    private computeJaccardSimilarityMatrix<RowKey extends string>(
        raw: KeyIndexedMatrix<RowKey, RowKey, number>,
    ): KeyIndexedMatrix<RowKey, RowKey, number> {
        const result: KeyIndexedMatrix<RowKey, RowKey, number> = {} as KeyIndexedMatrix<RowKey, RowKey, number>;
        const count = this.computeCooccurrenceCounts(raw);
        const rowKeys = Object.keys(raw) as RowKey[];
        for (const a of rowKeys) {
            result[a] ??= {} as Record<RowKey, number>;

            for (const b of rowKeys) {
                if (a === b) {
                    result[a][b] = 0;
                    continue;
                }
                const w = raw[a]?.[b] ?? 0;
                const denom = count[a] + count[b] - w;
                result[a][b] = denom > 0 ? w / denom : 0;
            }
        }
        return result;
    }

    private computeCooccurrenceCounts<RowKey extends string>(raw: KeyIndexedMatrix<RowKey, RowKey, number>): Record<RowKey, number> {
        const count: Record<RowKey, number> = {} as Record<RowKey, number>;

        for (const a of Object.keys(raw)) {
            const values = Object.values(raw[a]) as number[];
            count[a] = values.reduce((s, v) => s + (v > 0 ? 1 : 0), 0);
        }
        return count;
    }

    /**
     * 建立 NxN Cosine Similarity Matrix
     */
    private computeCosineSimilarityMatrix<RowKey extends string>(
        raw: KeyIndexedMatrix<RowKey, RowKey, number>,
    ): KeyIndexedMatrix<RowKey, RowKey, number> {
        const keys = Object.keys(raw) as RowKey[];
        const result: KeyIndexedMatrix<RowKey, RowKey, number> = {} as KeyIndexedMatrix<RowKey, RowKey, number>;

        const vectors = keys.map((a) => keys.map((b) => raw[a]?.[b] ?? 0));

        for (let i = 0; i < keys.length; i++) {
            result[keys[i]] ??= {} as Record<RowKey, number>;

            for (let j = 0; j < keys.length; j++) {
                if (i === j) {
                    result[keys[i]][keys[j]] = 0;
                    continue;
                }
                result[keys[i]][keys[j]] = this.cosineSimilarity(vectors[i], vectors[j]);
            }
        }

        return result;
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        let dot = 0,
            na = 0,
            nb = 0;

        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
    }
}
