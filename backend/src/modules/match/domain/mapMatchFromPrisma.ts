// backend/src/modules/match/domain/matchMapper.ts
import { mapCharacter } from '../../character';

import type {
    Character,
    Guest,
    Match,
    MatchMove,
    MatchTacticalUsage,
    MatchTeam,
    MatchTeamMember,
    Member,
    RandomMoveContext,
} from '@prisma/client';
import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IMatchTeam } from '@shared/contracts/match/IMatchTeam';
import type { IMatchTeamMember } from '@shared/contracts/match/IMatchTeamMember';
import type { IMatchTacticalUsage } from '@shared/contracts/match/IMatchTacticalUsage';
import type { IMatchMove } from '@shared/contracts/match/IMatchMove';
import type { MoveSource, MoveType } from '@shared/contracts/match/value-types';

// type PrismaMatchResult = Prisma.MatchGetPayload<typeof matchQuery>;

// Prisma include 查詢結果轉 Domain IMatch
export function mapMatchFromPrisma(m: (Match & { teams?: MatchTeam[]; moves?: MatchMove[] }) | undefined): IMatch {
    if (!m) throw new Error('Match not found');
    return {
        id: m.id,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        flowVersion: m.flowVersion,
        teams: m.teams?.map(mapTeam) ?? undefined,
        moves: m.moves?.map(mapMove) ?? undefined,
    };
}

// nested: TeamMapper
function mapTeam(team: MatchTeam & { teamMembers?: MatchTeamMember[] }): IMatchTeam {
    return {
        id: team.id,
        slot: team.slot,
        name: team.name ?? undefined,
        matchId: team.matchId,
        teamMembers: team.teamMembers?.map(mapTeamMember) ?? undefined,
    };
}

// nested: TeamMemberMapper
function mapTeamMember(tm: MatchTeamMember & { tacticalUsages?: MatchTacticalUsage[]; member?: Member; guest?: Guest }): IMatchTeamMember {
    return {
        id: tm.id,
        slot: tm.slot,
        name: tm.name,
        teamId: tm.teamId,
        memberRef: tm.memberRef,
        guestRef: tm.guestRef,
        tacticalUsages: tm.tacticalUsages?.map(mapTacticalUsage),
        member: tm.member,
        guest: tm.guest,
    };
}

// nested: TacticalUsageMapper
function mapTacticalUsage(t: MatchTacticalUsage & { character?: Character }): IMatchTacticalUsage {
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
function mapMove(move: MatchMove & { character?: Character; randomMoveContext?: RandomMoveContext }): IMatchMove {
    return {
        id: move.id,
        order: move.order,
        type: move.type as MoveType,
        source: move.source as MoveSource,
        matchId: move.matchId,
        teamId: move.teamId,
        characterKey: move.characterKey,
        character: mapCharacter(move.character),
        randomMoveContext: move.randomMoveContext,
    };
}

// function mapCharacter(character?: Character) {
//     if (!character) {
//         return null;
//     }
//     return mapCharacter(character);
// }
