// backend/src/services/analysis/tactical/types/ITacticalCoefficien.ts

export interface ITacticalCoefficients {
    pick: IPickCoefficients;
    ban: IBanCoefficients;
    utility: IUtilityCoefficients;
    clampRange: [number, number];
}

interface IPickCoefficients {
    base: number;
    random: number;
    randomFactor: number;
    notUsedFactor: number;
}

interface IBanCoefficients {
    base: number;
    random: number;
    randomFactor: number;
}

interface IUtilityCoefficients {
    base: number;
    random: number;
    randomFactor: number;
    usedOneSideFactor: number;
    usedBothSidesFactor: number;
}

// 🧮 預設係數
export const DEFAULT_TACTICAL_COEFFICIENTS: ITacticalCoefficients = {
    pick: {
        base: 1.0,
        random: 0.6,
        randomFactor: 0.1,
        notUsedFactor: 0.35,
    },

    ban: {
        base: 0.8,
        random: 0.6,
        randomFactor: 0.05,
    },

    utility: {
        base: 0.5,
        random: 0.3,
        randomFactor: 0.2,
        usedOneSideFactor: 2,
        usedBothSidesFactor: 3,
    },

    clampRange: [0, 1.5],
};