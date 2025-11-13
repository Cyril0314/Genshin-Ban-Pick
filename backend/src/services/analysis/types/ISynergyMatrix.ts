// backend/src/services/analysis/types/ISynergyMatrix.ts

export interface ISynergyMatrix {
    [characterKey: string]: {
        [otherKey: string]: number;
    };
}