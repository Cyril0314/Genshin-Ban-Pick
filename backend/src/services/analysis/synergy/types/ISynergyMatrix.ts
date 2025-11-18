// backend/src/services/analysis/synergy/types/ISynergyMatrix.ts

export interface ISynergyMatrix {
    [characterKey: string]: {
        [otherKey: string]: number;
    };
}