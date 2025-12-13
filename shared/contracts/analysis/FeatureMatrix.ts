// src/modules/analysis/types/FeatureMatrix.ts

export type FeatureMatrix<RowKey = string, ColKey = string, Value = number> = {
    /** keys for each row */
    rowKeys: RowKey[];

    /** keys for each column (feature dimension) */
    colKeys: ColKey[];

    /** matrix data */
    data: Value[][];
};