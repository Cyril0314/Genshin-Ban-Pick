// src/modules/analysis/types/IPreference.ts

export interface IPreference {
    player: string;
    characters: {
        characterKey: string;
        count: number;
    }[];
}