// backend/src/modules/analysis/infra/clustering/CharacterCommunityScanEngine.ts

import { UndirectedGraph } from 'graphology';
import { Matrix } from 'ml-matrix';
import kmeans from 'ml-kmeans';
// @ts-ignore
import betweenness from 'graphology-metrics/centrality/betweenness';
// @ts-ignore
import modularity from 'graphology-metrics/graph/modularity';
import louvain from 'graphology-communities-louvain';

import SynergyFeatureNormalizer from '../synergy/SynergyFeatureNormalizer';

import DimensionProjector from '../projection/DimensionProjector';

import type { ICommunityScanResult } from '../../domain/ICommunityScanResult';
import type { ISynergyMatrix } from '@shared/contracts/analysis/ISynergyMatrix';
import type { IBridgeScoreResult } from '@shared/contracts/analysis/IBridgeScoreResult';
import type { IArchetypePoint } from '@shared/contracts/analysis/IArchetypePoint';

export default class CharacterCommunityScanEngine {
    private rng: () => number;
    constructor(
        private dimensionProjector: DimensionProjector,
        private synergyFeatureNormalizer: SynergyFeatureNormalizer,
        seed: number = 20251114,
    ) {
        this.rng = createSeededRandom(seed);
    }

    async computeClusters(synergy: ISynergyMatrix, characterMap: Record<string, any>) {
        const graph = await this.buildSynergyGraph(synergy, characterMap);
        const k = await this.findBestClusterCount(graph);

        const { chars, matrix } = this.synergyFeatureNormalizer.normalizeForClustering(synergy);
        const clusterIds = this.clusterCharacters(matrix, k);

        const projected = this.dimensionProjector.projectCharacters2D(matrix, 2);

        const archetypes = chars.map((c, i) => ({
            characterKey: c,
            clusterId: clusterIds[i],
        }));

        const clusterMedoids: IArchetypePoint[] = this.computeClusterMedoids(chars, clusterIds, projected);
        const bridgeScores = this.computeBridgeScores(graph, chars, clusterIds, projected);
        return {
            archetypes,
            // matrix,
            projected,
            // clusterIds,
            clusterMedoids,
            bridgeScores,
        };
    }

    async findBestClusterCount(graph: UndirectedGraph, resolutions: number[] = [0.6, 0.8, 1.0, 1.2, 1.5]): Promise<number> {
        const scan = this.runLouvainOnGraph(graph, resolutions);
        console.log(`scan`, scan);
        const best = scan.reduce((a, b) => (a.modularity > b.modularity ? a : b));
        return best.clusters;
    }

    clusterCharacters(matrix: Matrix, k: number): number[] {
        // @ts-ignore
        const result = kmeans.kmeans(matrix.to2DArray(), k, {
            initialization: 'kmeans++',
            seed: this.rng(),
        });
        return result.clusters;
    }

    computeClusterMedoids(chars: string[], clusterIds: number[], pcaPoints: number[][]): IArchetypePoint[] {
        const clusters: Record<number, number[]> = {};

        // 1) 分群
        clusterIds.forEach((cid, i) => {
            if (!clusters[cid]) clusters[cid] = [];
            clusters[cid].push(i);
        });

        const medoids: { clusterId: number; characterKey: string; x: number; y: number }[] = [];

        // 2) 對每群分別計算 medoid
        for (const [cidStr, indices] of Object.entries(clusters)) {
            const cid = Number(cidStr);

            let bestIndex = -1;
            let bestScore = Infinity;

            // 對群內每個角色計算「與其他成員的距離總和」
            for (const i of indices) {
                let totalDist = 0;
                const [xi, yi] = pcaPoints[i];

                for (const j of indices) {
                    if (i === j) continue;

                    const [xj, yj] = pcaPoints[j];
                    const dx = xi - xj;
                    const dy = yi - yj;
                    totalDist += Math.sqrt(dx * dx + dy * dy);
                }

                if (totalDist < bestScore) {
                    bestScore = totalDist;
                    bestIndex = i;
                }
            }
            medoids.push({
                clusterId: cid,
                characterKey: chars[bestIndex],
                x: pcaPoints[bestIndex][0],
                y: pcaPoints[bestIndex][1],
            });
        }

        return medoids;
    }

    computeBridgeScores(graph: UndirectedGraph, chars: string[], clusterIds: number[], pcaPoints: number[][]): IBridgeScoreResult[] {
        // ---------------------------
        // 1) Precompute cluster centers in PCA space
        // ---------------------------
        const clusterCenters: Record<number, { x: number; y: number; count: number }> = {};

        chars.forEach((char, i) => {
            const c = clusterIds[i];
            const [x, y] = pcaPoints[i];

            if (!clusterCenters[c]) clusterCenters[c] = { x: 0, y: 0, count: 0 };

            clusterCenters[c].x += x;
            clusterCenters[c].y += y;
            clusterCenters[c].count++;
        });

        for (const c of Object.keys(clusterCenters)) {
            const cc = clusterCenters[Number(c)];
            cc.x /= cc.count;
            cc.y /= cc.count;
        }

        // ---------------------------
        // 2) Compute Betweenness Centrality
        // ---------------------------
        const bcTable = betweenness(graph);

        // ---------------------------
        // 3) Compute metrics per node
        // ---------------------------
        const rawResults = chars.map((char, i) => {
            const myCluster = clusterIds[i];
            const [x, y] = pcaPoints[i];

            // ---- A) Boundary Score (距離自己中心 vs 最近其他中心) ----
            const ownCenter = clusterCenters[myCluster];
            const ownDist = Math.sqrt((x - ownCenter.x) ** 2 + (y - ownCenter.y) ** 2);

            let nearestOtherDist = Infinity;
            for (const c of Object.keys(clusterCenters)) {
                const cid = Number(c);
                if (cid === myCluster) continue;
                const center = clusterCenters[cid];
                const d = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
                if (d < nearestOtherDist) nearestOtherDist = d;
            }

            // 角色越接近邊界 → boundary 越高
            const boundary = nearestOtherDist === Infinity ? 0 : ownDist / nearestOtherDist;

            // ---- B) Betweenness ----
            const bc = bcTable[char] ?? 0;

            // ---- C) Cross-Cluster Degree ----
            const neighbors = graph.neighbors(char);
            if (!neighbors || neighbors.length === 0) {
                return {
                    characterKey: char,
                    boundary,
                    betweenness: bc,
                    cross: 0,
                };
            }

            let crossCount = 0;
            for (const nb of neighbors) {
                const nbIndex = chars.indexOf(nb);
                if (nbIndex === -1) continue;
                if (clusterIds[nbIndex] !== myCluster) crossCount++;
            }

            const cross = crossCount / neighbors.length;

            return {
                characterKey: char,
                boundary,
                betweenness: bc,
                cross,
            };
        });

        // ---------------------------
        // 4) Normalize all metrics & compute final Bridge Score
        // ---------------------------
        const normalize = (values: number[]) => {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min || 1;
            return values.map((v) => (v - min) / range);
        };

        const boundaries = normalize(rawResults.map((r) => r.boundary));
        const betweennesses = normalize(rawResults.map((r) => r.betweenness));
        const crosses = normalize(rawResults.map((r) => r.cross));

        const results: IBridgeScoreResult[] = rawResults.map((r, i) => {
            const bridgeScore = boundaries[i] * 0.4 + betweennesses[i] * 0.4 + crosses[i] * 0.2;

            return {
                characterKey: r.characterKey,
                boundary: boundaries[i],
                betweenness: betweennesses[i],
                cross: crosses[i],
                bridgeScore,
            };
        });

        // 排序（橋接度最高在最上）
        return results.sort((a, b) => b.bridgeScore - a.bridgeScore);
    }

    // ... (constructor 和其他方法省略)

    /**
     * @description 建立協同圖：使用 Adaptive Thresholding 和 Top-K 策略進行預處理
     * @param K_NEIGHBORS 每個節點至少保留的連線數 (K)
     * @param ADAPTIVE_FACTOR 局部平均的比例 (0.6 意味著保留大於 60% 局部平均的連線)
     * @param WEIGHT_POWER 權重壓縮程度 (1.5 比 2.0 更溫和)
     */
    async buildSynergyGraph(
        synergy: ISynergyMatrix,
        characterMap: Record<string, any>,
        K_NEIGHBORS: number = 6,
        ADAPTIVE_FACTOR: number = 0.6,
        WEIGHT_POWER: number = 1.5,
    ): Promise<UndirectedGraph> {
        const graph = new UndirectedGraph();
        // 確保 normalizationService 輸出的是 0-1 的標準化權重
        const normalSynergy = this.synergyFeatureNormalizer.normalizeForGraph(synergy, 'jaccard');

        const chars = Object.keys(synergy);
        chars.forEach((char) => graph.addNode(char, characterMap[char]));

        // 步驟 1: 預處理並收集所有潛在的 Edge，同時計算局部平均 degree-aware thresholding
        const potentialEdges: { a: string; b: string; w: number }[] = [];
        const localMeans: Record<string, number> = {};

        for (const charA of chars) {
            const weights = Object.values(normalSynergy[charA] ?? {}).filter((w) => w > 0);

            // 計算局部平均 (Local Mean, μ)
            const sum = weights.reduce((acc, w) => acc + w, 0);
            localMeans[charA] = sum / weights.length || 0;

            for (const charB of chars) {
                if (charA >= charB) continue;

                const w = normalSynergy[charA]?.[charB] ?? 0;
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

    private runLouvainOnGraph(graph: UndirectedGraph, resolutions: number[]): ICommunityScanResult[] {
        const result: ICommunityScanResult[] = [];

        for (const gamma of resolutions) {
            // @ts-ignore: graphology-communities-louvain 型別 issue
            const mapping = louvain(graph, {
                resolution: gamma,
                nodeCommunityAttribute: 'community',
                rng: this.rng,
            });
            for (const node of graph.nodes()) {
                graph.setNodeAttribute(node, 'community', mapping[node]);
            }
            const clusters = new Set(Object.values(mapping)).size;
            const Q = modularity(graph, mapping);

            result.push({
                resolution: gamma,
                clusters,
                modularity: Q,
            });
        }

        return result;
    }
}

function createSeededRandom(seed = 123456) {
    let state = seed;
    return function random() {
        state = (state * 20251120) % 2147483647;
        return Math.floor((state - 1) / 2147483646);
    };
}
