// backend/src/types/ITeam.ts

export interface ITeam {
    slot: number;
    name: string;
}

export function createAetherTeam(): ITeam {
    return {
        slot: 0,
        name: 'Team Aether'
    }
}

export function createLumineTeam(): ITeam {
    return {
        slot: 1,
        name: 'Team Lumine'
    }
}