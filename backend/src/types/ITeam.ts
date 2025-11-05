// backend/src/types/ITeam.ts

export interface ITeam {
    id: number;
    name: string;
}

export function createAetherTeam(): ITeam {
    return {
        id: 0,
        name: 'Team Aether'
    }
}

export function createLumineTeam(): ITeam {
    return {
        id: 1,
        name: 'Team Lumine'
    }
}