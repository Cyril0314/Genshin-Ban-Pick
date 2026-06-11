// backend/src/modules/analysis/domain/CooccurrenceMatrixBuilder.ts

import type { KeyIndexedMatrix } from "@shared/contracts/analysis/KeyIndexedMatrix";

export default class CooccurrenceMatrixBuilder {
    constructor() {}

    build(groups: Record<string, string[]>): KeyIndexedMatrix<string, string> {
        const matrix: KeyIndexedMatrix<string, string> = {};

        for (const group of Object.values(groups)) {
            // 去重，避免同一 group 同一角色被算兩次
            const uniq = [...new Set(group)];

            for (let i = 0; i < uniq.length; i++) {
                for (let j = i + 1; j < uniq.length; j++) {
                    const a = uniq[i];
                    const b = uniq[j];

                    matrix[a] ??= {};
                    matrix[b] ??= {};
                    matrix[a][b] = (matrix[a][b] || 0) + 1;
                    matrix[b][a] = (matrix[b][a] || 0) + 1;
                }
            }
        }

        return matrix;
    }
}
