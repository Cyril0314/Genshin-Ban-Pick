// backend/src/modules/analyses/application/synergy/SynergyNormalizationService.ts

import { Matrix } from 'ml-matrix';
import { ISynergyMatrix } from './types/ISynergyMatrix.ts';

/**
 * SynergyNormalizationService
 *
 * 負責：
 * - Graph 用的 similarity normalization（Jaccard / Cosine）
 * - PCA / KMeans 用的 Z-score normalization
 */
export class SynergyNormalizationService {
    constructor() {}

    // ---------------------------------------------------------
    // 1) Graph-level normalization (similarity-based)
    // ---------------------------------------------------------

    /**
     * 計算每個角色的出場次數，用於 Jaccard denominator
     */
    private computeCounts(raw: ISynergyMatrix): Record<string, number> {
        const count: Record<string, number> = {};

        for (const a of Object.keys(raw)) {
            count[a] = Object.values(raw[a]).reduce((s, v) => s + (v > 0 ? 1 : 0), 0);
        }
        return count;
    }

    /**
     * Jaccard Similarity
     * J = w_ab / (count[a] + count[b] - w_ab)
     */
    private applyJaccard(raw: ISynergyMatrix): ISynergyMatrix {
        const result: ISynergyMatrix = {};
        const count = this.computeCounts(raw);

        for (const a of Object.keys(raw)) {
            result[a] ??= {};

            for (const b of Object.keys(raw)) {
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

    /**
     * 向量的 Cosine similarity
     */
    private cosine(a: number[], b: number[]): number {
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

    /**
     * 建立 NxN Cosine Similarity Matrix
     */
    private applyCosine(raw: ISynergyMatrix): ISynergyMatrix {
        const chars = Object.keys(raw);
        const result: ISynergyMatrix = {};

        const vectors = chars.map((a) => chars.map((b) => raw[a]?.[b] ?? 0));

        for (let i = 0; i < chars.length; i++) {
            result[chars[i]] ??= {};

            for (let j = 0; j < chars.length; j++) {
                if (i === j) {
                    result[chars[i]][chars[j]] = 0;
                    continue;
                }
                result[chars[i]][chars[j]] = this.cosine(vectors[i], vectors[j]);
            }
        }

        return result;
    }

    /**
     * Graph 用入口：回傳 similarity matrix
     * a→b = similarity score
     * 必須是 { [charA]: { [charB]: number } }
     * 用於 Graphology 的 edge weights
     */
    normalizeForGraph(raw: ISynergyMatrix, mode: 'jaccard' | 'cosine' = 'jaccard'): ISynergyMatrix {
        return mode === 'jaccard' ? this.applyJaccard(raw) : this.applyCosine(raw);
    }

    // ---------------------------------------------------------
    // 2) Matrix-level normalization (Z-Score for PCA / KMeans)
    // ---------------------------------------------------------

    /**
     * 轉 NxN matrix → Z-score
     * 用於 PCA + KMeans，不是 similarity
     * Z-score 是「角色向量」矩陣
     * 
     * 每一列 = 一個角色
     * 每一欄 =「他與所有角色的共現強度」的特徵
     */
    normalizeForClustering(raw: ISynergyMatrix): { chars: string[]; matrix: Matrix } {
        const chars = Object.keys(raw).sort();

        // NxN raw matrix
        let matrix = new Matrix(chars.map((a) => chars.map((b) => raw[a]?.[b] ?? 0)));

        // column-wise mean & std
        const colMeans = matrix.mean('column');
        const colStds = matrix.standardDeviation('column');

        const colMeanVec = Matrix.columnVector(colMeans);
        const colStdVec = Matrix.columnVector(colStds);

        // Z-score → (M - mean) / std
        matrix = matrix.subColumnVector(colMeanVec).divColumnVector(colStdVec);

        return { chars, matrix };
    }
}
