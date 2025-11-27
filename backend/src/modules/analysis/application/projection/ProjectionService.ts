// backend/src/modules/analysis/application/projection/ProjectionService.ts
import PCA from 'ml-pca';
import { Matrix } from 'ml-matrix';

export class ProjectionService {
    constructor() {}

    projectCharacters2D(matrix: Matrix, nComponents = 2): number[][] {
        // @ts-ignore
        const pca = new PCA.PCA(matrix.to2DArray());
        const projected = pca.predict(matrix.to2DArray(), { nComponents }).to2DArray();

        return projected;
    }
}