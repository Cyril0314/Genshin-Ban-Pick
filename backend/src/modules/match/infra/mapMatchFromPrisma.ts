// backend/src/modules/match/infra/mapMatchFromPrisma.ts
import { mapCharacter } from '../../character';

import type { Character, Guest, Match, MatchMove, MatchLineupSlot, MatchTeam, MatchTeamMember, Member, RandomMoveContext } from '@prisma/client';
import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IMatchTeam } from '@shared/contracts/match/IMatchTeam';
import type { IMatchTeamMember } from '@shared/contracts/match/IMatchTeamMember';
import type { IMatchLineupSlot } from '@shared/contracts/match/IMatchLineupSlot';
import type { IMatchMove } from '@shared/contracts/match/IMatchMove';
import type { MoveSource, MoveType } from '@shared/contracts/match/value-types';

// Prisma include 查詢結果轉 Domain IMatch
// 入參需保證非 null/undefined — 由 caller (repository) 確認資料存在
export function mapMatchFromPrisma(m: Match & { teams?: MatchTeam[]; moves?: MatchMove[] }): IMatch {
    return {
        id: m.id,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        flowVersion: m.flowVersion,
        teams: m.teams?.map(mapTeamFromPrisma) ?? undefined,
        moves: m.moves?.map(mapMoveFromPrisma) ?? undefined,
    };
}

// nested: TeamMapper
function mapTeamFromPrisma(team: MatchTeam & { teamMembers?: MatchTeamMember[] }): IMatchTeam {
    return {
        id: team.id,
        slot: team.slot,
        name: team.name ?? undefined,
        matchId: team.matchId,
        teamMembers: team.teamMembers?.map(mapTeamMemberFromPrisma) ?? undefined,
    };
}

// nested: TeamMemberMapper
function mapTeamMemberFromPrisma(tm: MatchTeamMember & { lineupSlots?: MatchLineupSlot[]; member?: Member; guest?: Guest }): IMatchTeamMember {
    return {
        id: tm.id,
        slot: tm.slot,
        name: tm.name,
        teamId: tm.teamId,
        memberRef: tm.memberRef ?? undefined,
        guestRef: tm.guestRef ?? undefined,
        lineupSlots: tm.lineupSlots?.map(mapLineupSlotFromPrisma),
        member: tm.member,
        guest: tm.guest,
    };
}

// nested: LineupSlotMapper
function mapLineupSlotFromPrisma(t: MatchLineupSlot & { character?: Character }): IMatchLineupSlot {
    return {
        id: t.id,
        modelVersion: t.modelVersion,
        setupNumber: t.setupNumber,
        teamMemberId: t.teamMemberId,
        characterKey: t.characterKey,
        character: t.character ? mapCharacter(t.character) : undefined,
    };
}

// nested: MoveMapper
function mapMoveFromPrisma(move: MatchMove & { character?: Character; randomMoveContext?: RandomMoveContext }): IMatchMove {
    return {
        id: move.id,
        order: move.order,
        type: move.type as MoveType,
        source: move.source as MoveSource,
        matchId: move.matchId,
        teamId: move.teamId ?? undefined,
        characterKey: move.characterKey,
        character: move.character ? mapCharacter(move.character) : undefined,
        randomMoveContext: move.randomMoveContext,
    };
}
