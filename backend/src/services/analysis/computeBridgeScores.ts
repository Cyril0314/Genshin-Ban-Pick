// computeBridgeScores.ts
import { UndirectedGraph } from 'graphology';
// @ts-ignore
import betweenness from 'graphology-metrics/centrality/betweenness';

export interface BridgeScoreResult {
    characterKey: string;
    boundary: number;
    betweenness: number;
    cross: number;
    bridgeScore: number;
}

export function computeBridgeScores(
    graph: UndirectedGraph,
    pcaPoints: number[][], // [[x,y], ...]，按 chars 排序
    chars: string[], // 角色 key[]，與 pcaPoints 同順序
    clusterIds: number[], // 每個角色對應的 cluster id
): BridgeScoreResult[] {
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

    const results: BridgeScoreResult[] = rawResults.map((r, i) => {
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
