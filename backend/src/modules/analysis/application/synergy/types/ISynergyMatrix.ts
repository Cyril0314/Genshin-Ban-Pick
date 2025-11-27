// backend/src/modules/analysis/application/synergy/types/ISynergyMatrix.ts

export interface ISynergyMatrix {
    [characterKey: string]: {
        [otherKey: string]: number;
    };
}