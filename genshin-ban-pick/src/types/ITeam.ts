// src/types/ITeam.ts

export interface ITeam {
    id: number;
    name: string;
}

export type TeamMembersMap = Record<number, string>;