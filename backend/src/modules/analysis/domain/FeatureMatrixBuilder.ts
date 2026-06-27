// backend/src/modules/analysis/domain/FeatureMatrixBuilder.ts

import type { CharacterCooccurrenceMatrix } from '@shared/contracts/analysis/CharacterCooccurrenceMatrix';
import type { FeatureMatrix } from '@shared/contracts/analysis/FeatureMatrix';

export default class FeatureMatrixBuilder {
    build(matrix: CharacterCooccurrenceMatrix): FeatureMatrix<string, string> {
        const rowKeys = Object.keys(matrix).sort();
        const colKeys = [...rowKeys]; // 特徵軸與角色相同（signature vector）

        const data: number[][] = rowKeys.map((row) => colKeys.map((col) => matrix[row]?.[col] ?? 0));

        return {
            rowKeys,
            colKeys,
            data,
        };
    }
}
