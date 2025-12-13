// backend/src/modules/analysis/infra/graph/CharacterSynergyGraphBuilder.ts

import { UndirectedGraph } from 'graphology';

import SquareSimilarityMatrixBuilder from '../matrix/SquareSimilarityMatrixBuilder';

import type { CharacterSynergyMatrix } from '@shared/contracts/analysis/CharacterSynergyMatrix';

export default class CharacterSynergyGraphBuilder {
    constructor(private squareSimilarityMatrixBuilder: SquareSimilarityMatrixBuilder) {}
    /**
     * @description 建立協同圖：使用 Adaptive Thresholding 和 Top-K 策略進行預處理
     * @param K_NEIGHBORS 每個節點至少保留的連線數 (K)
     * @param ADAPTIVE_FACTOR 局部平均的比例 (0.6 意味著保留大於 60% 局部平均的連線)
     * @param WEIGHT_POWER 權重壓縮程度 (1.5 比 2.0 更溫和)
     */
    async build(
        synergyMatrix: CharacterSynergyMatrix,
        characterMap: Record<string, any>,
        K_NEIGHBORS: number = 12,
        ADAPTIVE_FACTOR: number = 0.4,
        WEIGHT_POWER: number = 1.2,
    ): Promise<UndirectedGraph> {
        const graph = new UndirectedGraph();
        // 相似度分析
        const similarityMatrix = this.squareSimilarityMatrixBuilder.build(synergyMatrix, 'jaccard');

        const chars = Object.keys(similarityMatrix);
        chars.forEach((char) => graph.addNode(char, characterMap[char]));

        // 步驟 1: 預處理並收集所有潛在的 Edge，同時計算局部平均 degree-aware thresholding
        const potentialEdges: { a: string; b: string; w: number }[] = [];
        const localMeans: Record<string, number> = {};

        for (const charA of chars) {
            const weights = Object.values(similarityMatrix[charA] ?? {}).filter((w) => w > 0);

            // 計算局部平均 (Local Mean, μ)
            const sum = weights.reduce((acc, w) => acc + w, 0);
            localMeans[charA] = sum / weights.length || 0;

            for (const charB of chars) {
                if (charA >= charB) continue;

                const w = similarityMatrix[charA]?.[charB] ?? 0;
                if (w > 0) {
                    potentialEdges.push({ a: charA, b: charB, w });
                }
            }
        }

        // 步驟 2: 進行 Adaptive Thresholding 和 Top-K Pruning
        const finalEdges: Record<string, { b: string; w: number }[]> = {}; // 儲存每個節點的候選連線

        // 初始化 finalEdges 結構
        chars.forEach((char) => (finalEdges[char] = []));

        for (const { a, b, w } of potentialEdges) {
            // 檢查 Adaptive Threshold
            // 必須大於 A 的局部平均 * 因子 AND 大於 B 的局部平均 * 因子 (取較鬆的條件，讓連線更容易建立)
            const thresholdA = localMeans[a] * ADAPTIVE_FACTOR;
            const thresholdB = localMeans[b] * ADAPTIVE_FACTOR;

            // 只要大於任一邊的閾值，就納入 Top-K 候選名單 (防止冷門角色被殺光)
            if (w > thresholdA || w > thresholdB) {
                finalEdges[a].push({ b, w });
                finalEdges[b].push({ b: a, w }); // 紀錄反向，方便Top-K處理
            }
        }

        const addedEdges = new Set<string>();

        // 步驟 3: Top-K Pruning + 權重強化
        for (const charA of chars) {
            // 排序並只保留 K_NEIGHBORS (Top-K)
            const topEdges = finalEdges[charA].sort((x, y) => y.w - x.w).slice(0, K_NEIGHBORS);

            for (const { b, w } of topEdges) {
                // 使用字典序確保每條邊只加一次
                const key = charA < b ? `${charA}-${b}` : `${b}-${charA}`;

                if (!addedEdges.has(key)) {
                    // 權重強化：w' = w^1.5 (溫和壓縮)
                    const poweredWeight = Math.pow(w, WEIGHT_POWER);

                    graph.addUndirectedEdgeWithKey(key, charA, b, { weight: poweredWeight });
                    addedEdges.add(key);
                }
            }
        }

        return graph;
    }
}
