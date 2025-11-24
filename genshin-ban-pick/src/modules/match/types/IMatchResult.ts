// src/modules/room/types/IMatchResult.ts

/** ------------- 基本 Character ------------- */
export interface ICharacter {
    id: number;
    key: string;
    name: string;
    rarity: string;
    element: string;
    weapon: string;
    region: string;
    modelType: string;
    role?: string | null;
    wish?: string | null;
    releaseDate?: string | null;
    version?: string | null;
}

/** ------------- MatchTacticalUsage ------------- */
export interface IMatchTacticalUsage {
    id: number;
    modelVersion: number;
    setupNumber: number;

    teamMemberId: number;
    characterKey: string;

    character: ICharacter;
}

/** ------------- Member / Guest ------------- */
export interface IMatchMemberUser {
    id: number;
    nickname: string;
}

/** ------------- MatchTeamMember ------------- */
export interface IMatchTeamMember {
    id: number;
    slot: number;
    name: string;

    teamId: number;
    memberRef?: number | null;
    guestRef?: number | null;

    tacticalUsages: IMatchTacticalUsage[];

    member: IMatchMemberUser | null;
    guest: IMatchMemberUser | null;
}

/** ------------- MatchTeam ------------- */
export interface IMatchTeam {
    id: number;
    slot: number;
    name?: string | null;
    matchId: number;

    teamMembers: IMatchTeamMember[];
}

/** ------------- RandomMoveContext ------------- */
export interface IRandomMoveContext {
    id: number;
    filters?: any; // JSON
    matchMoveId: number;
}

/** ------------- MatchMove ------------- */
export interface IMatchMove {
    id: number;
    order: number;
    type: 'Ban' | 'Pick' | 'Utility';
    source: 'Manual' | 'Random';

    matchId: number;
    teamId?: number | null;
    characterKey: string;

    character: ICharacter;
    randomMoveContext: IRandomMoveContext | null;
}

/** ------------- Match本體（最終回傳）------------- */
export interface IMatchResult {
    id: number;
    createdAt: string;
    updatedAt: string;
    flowVersion: number;

    teams: IMatchTeam[];
    moves: IMatchMove[];
}
