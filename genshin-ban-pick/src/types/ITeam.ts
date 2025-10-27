// src/types/ITeam.ts

import type { IRoomUser } from "./IRoomUser";

export interface ITeam {
    id: number;
    name: string;
}

export type TeamMembersMap = Record<number, TeamMember[]>;

export type TeamMember =
    | { type: 'online'; user: IRoomUser }
    | { type: 'manual'; name: string };