// backend/src/services/analysis/clustering/ClusteringService.ts

import { UndirectedGraph } from 'graphology';
import { Matrix } from 'ml-matrix';
import kmeans from 'ml-kmeans';
// @ts-ignore
import betweenness from 'graphology-metrics/centrality/betweenness';
// @ts-ignore
import modularity from 'graphology-metrics/graph/modularity';
import louvain from 'graphology-communities-louvain';

import { SynergyNormalizationService } from '../synergy/SynergyNormalizationService.ts';

import { ProjectionService } from '../projection/ProjectionService.ts';
import { ICommunityScanResult } from './types/ICommunityScanResult.ts';
import { ISynergyMatrix } from '../synergy/types/ISynergyMatrix.ts';
import { IBridgeScoreResult } from './types/IBridgeScoreResult.ts';

export class ClusteringService {
    private rng: () => number;
    constructor(
        private projectionService: ProjectionService,
        private synergyNormalizationService: SynergyNormalizationService,
        seed: number = 20251114
    ) {
        this.rng = createSeededRandom(seed);
    }

    async computeClusters(synergy: ISynergyMatrix, characterMap: Record<string, any>) {
        const graph = await this.buildSynergyGraph(synergy, characterMap);
        const k = await this.findBestClusterCount(graph);

        const { chars, matrix } = this.synergyNormalizationService.normalizeForClustering(synergy);
        const clusterIds = this.clusterCharacters(matrix, k);

        const projected = this.projectionService.projectCharacters2D(matrix, 2);

        const archetypes = chars.map((c, i) => ({
            characterKey: c,
            clusterId: clusterIds[i],
        }));

        const clusterMedoids = this.computeClusterMedoids(chars, clusterIds, projected);
        const bridgeScores = this.computeBridgeScores(graph, chars, clusterIds, projected);
        return {
            archetypes,
            matrix,
            projected,
            clusterIds,
            clusterMedoids,
            bridgeScores,
        };
    }

    async findBestClusterCount(graph: UndirectedGraph, resolutions: number[] = [0.5, 0.8, 1.0, 1.2, 1.5]): Promise<number> {
        const scan = this.runLouvainOnGraph(graph, resolutions);
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

    computeClusterMedoids(chars: string[], clusterIds: number[], pcaPoints: number[][]) {
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

    async buildSynergyGraph(synergy: ISynergyMatrix, characterMap: Record<string, any>): Promise<UndirectedGraph> {
        const graph = new UndirectedGraph();
        const normalSynergy = this.synergyNormalizationService.normalizeForGraph(synergy, 'jaccard');

        const chars = Object.keys(synergy);
        for (const char of chars) graph.addNode(char, characterMap[char]);

        for (const a of chars) {
            for (const b of chars) {
                if (a >= b) continue; // 避免重複兩邊（字典序避免）
                const w = normalSynergy[a]?.[b] ?? 0;
                if (w > 0) {
                    graph.addUndirectedEdgeWithKey(`${a}-${b}`, a, b, { weight: w });
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
        state = (state * 16807) % 2147483647;
        return Math.floor((state - 1) / 2147483646);
    };
}