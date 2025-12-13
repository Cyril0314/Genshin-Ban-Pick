// backend/src/modules/analysis/infra/synergy/MatrixNormalizer.ts

import { Matrix } from 'ml-matrix';

import type { FeatureMatrix } from '@shared/contracts/analysis/FeatureMatrix';

export default class MatrixNormalizer {
    constructor() {}

    normalize<RowKey extends string, ColKey extends string>(raw: FeatureMatrix<RowKey, ColKey, number>): FeatureMatrix<RowKey, ColKey, number> {
        const { rowKeys, colKeys, data } = raw;

        let matrix = new Matrix(data); // rows = 86, cols = 110

        // column-wise means and std
        const colMeans = matrix.mean('column'); // length = 110
        const colStds = matrix.standardDeviation('column'); // length = 110
        // const safeStd = colStds.map(s => (s === 0 ? 1 : s));

        // Z-score normalization
        // (x - mean) / std   --> subtract row-vector, divide row-vector
        matrix = matrix.subRowVector(colMeans).divRowVector(colStds);

        return {
            rowKeys,
            colKeys,
            data: matrix.to2DArray(),
        };
    }
}
