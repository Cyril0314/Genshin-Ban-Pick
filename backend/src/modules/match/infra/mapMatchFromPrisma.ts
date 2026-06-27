// backend/src/modules/match/infra/mapMatchFromPrisma.ts
import { mapCharacter } from '../../character';

import type { Character, Guest, Match, MatchMove, MatchLineupSlot, MatchTeam, MatchTeamMember, Member, RandomMoveContext } from '@prisma/client';
import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IMatchTeam } from '@shared/contracts/match/IMatchTeam';
import type { IMatchTeamMember } from '@shared/contracts/match/IMatchTeamMember';
import type { IMatchLineupSlot } from '@shared/contracts/match/IMatchLineupSlot';
import type { IMatchMove } from '@shared/contracts/match/IMatchMove';
import type { MoveSource, MoveType } from '@shared/contracts/match/value-types';

// 完整查詢的關聯形狀（對齊 matchInclude）：必存在的關聯不為 undefined；
// 只有 schema 真正可空的（character 以外的 to-one、name）才 null/undefined。
type SlotWithCharacter = MatchLineupSlot & { character: Character };
type MoveWithRelations = MatchMove & { character: Character; randomMoveContext: RandomMoveContext | null };
type TeamMemberWithRelations = MatchTeamMember & { lineupSlots: SlotWithCharacter[]; member: Member | null; guest: Guest | null };
type TeamWithRelations = MatchTeam & { teamMembers: TeamMemberWithRelations[] };

export function mapMatchFromPrisma(m: Match & { teams: TeamWithRelations[]; moves: MoveWithRelations[] }): IMatch {
    return {
        id: m.id,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        flowVersion: m.flowVersion,
        teams: m.teams.map(mapTeamFromPrisma),
        moves: m.moves.map(mapMoveFromPrisma),
    };
}

// nested: TeamMapper
function mapTeamFromPrisma(team: TeamWithRelations): IMatchTeam {
    return {
        id: team.id,
        slot: team.slot,
        name: team.name ?? undefined,
        matchId: team.matchId,
        teamMembers: team.teamMembers.map(mapTeamMemberFromPrisma),
    };
}

// nested: TeamMemberMapper
function mapTeamMemberFromPrisma(tm: TeamMemberWithRelations): IMatchTeamMember {
    return {
        id: tm.id,
        slot: tm.slot,
        name: tm.name,
        teamId: tm.teamId,
        memberRef: tm.memberRef ?? undefined,
        guestRef: tm.guestRef ?? undefined,
        lineupSlots: tm.lineupSlots.map(mapLineupSlotFromPrisma),
        member: tm.member ?? undefined,
        guest: tm.guest ?? undefined,
    };
}

// nested: LineupSlotMapper
function mapLineupSlotFromPrisma(t: SlotWithCharacter): IMatchLineupSlot {
    return {
        id: t.id,
        modelVersion: t.modelVersion,
        setupNumber: t.setupNumber,
        teamMemberId: t.teamMemberId,
        characterKey: t.characterKey,
        character: mapCharacter(t.character),
    };
}

// nested: MoveMapper
export function mapMoveFromPrisma(move: MoveWithRelations): IMatchMove {
    return {
        id: move.id,
        order: move.order,
        type: move.type as MoveType,
        source: move.source as MoveSource,
        matchId: move.matchId,
        teamId: move.teamId ?? undefined,
        characterKey: move.characterKey,
        character: mapCharacter(move.character),
        randomMoveContext: move.randomMoveContext ?? undefined,
    };
}
