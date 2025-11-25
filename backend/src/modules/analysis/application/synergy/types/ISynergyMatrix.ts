// backend/src/modules/analyses/application/synergy/types/ISynergyMatrix.ts

export interface ISynergyMatrix {
    [characterKey: string]: {
        [otherKey: string]: number;
    };
}