// backend/src/modules/analysis/infra/projection/FeatureMatrixBuilder.ts

import type { CharacterSynergyMatrix } from '@shared/contracts/analysis/CharacterSynergyMatrix';
import type { FeatureMatrix } from '@shared/contracts/analysis/FeatureMatrix';

export default class FeatureMatrixBuilder {
    buildSynergySignatureFeatureMatrix(synergyMatrix: CharacterSynergyMatrix): FeatureMatrix<string, string> {
        const rowKeys = Object.keys(synergyMatrix).sort();
        const colKeys = [...rowKeys]; // 特徵軸與角色相同（signature vector）

        const data: number[][] = rowKeys.map((row) => colKeys.map((col) => synergyMatrix[row]?.[col] ?? 0));

        return {
            rowKeys,
            colKeys,
            data,
        };
    }
}
