// backend/src/modules/analysis/infra/projection/UMAPProjector.ts

import { UMAP } from 'umap-js';

export default class UMAPProjector {
    constructor(
        private nNeighbors = 10,
        private minDist = 0.15,
    ) {}

    project(data: number[][], dim = 2, random: () => number): number[][] {
        const umap = new UMAP({
            nComponents: dim,
            nNeighbors: this.nNeighbors,
            minDist: this.minDist,
            random: random,
        });

        return umap.fit(data);
    }
}
