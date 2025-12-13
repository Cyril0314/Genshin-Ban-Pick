// backend/src/modules/analysis/infra/projection/DimensionProjector.ts
import PCA from 'ml-pca';

export default class DimensionProjector {
    constructor() {}

    project(data: number[][], nComponents = 2): number[][] {
        // @ts-ignore
        const pca = new PCA.PCA(data);
        const projected = pca.predict(data, { nComponents }).to2DArray();
        // console.log("explained variance ratio:", pca.getExplainedVariance());

        return projected;
    }
}