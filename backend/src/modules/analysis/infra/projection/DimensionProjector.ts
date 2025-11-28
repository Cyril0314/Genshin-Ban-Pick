// backend/src/modules/analysis/infra/projection/DimensionProjector.ts
import PCA from 'ml-pca';
import { Matrix } from 'ml-matrix';

export default class DimensionProjector {
    constructor() {}

    projectCharacters2D(matrix: Matrix, nComponents = 2): number[][] {
        // @ts-ignore
        const pca = new PCA.PCA(matrix.to2DArray());
        const projected = pca.predict(matrix.to2DArray(), { nComponents }).to2DArray();

        return projected;
    }
}