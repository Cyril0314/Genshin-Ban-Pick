// src/modules/analysis/domain/IAnalysisRepository.ts

import { Prisma } from '@prisma/client';

export default interface IAnalysisRepository {
    findAllMatches: Promise<MatchDTO[]>;

    fincAllMatchMoves: Promise<MatchMoveDTO[]>;

    findAllMatchTacticalUsages: Promise<MatchTacticalUsageDTO[]>;
}

type MatchDTO = Prisma.MatchGetPayload<{ select: { id: true; createdAt: true } }>;

type MatchMoveDTO = Prisma.MatchMoveGetPayload<{
    select: {
        type: true;
        source: true;
        matchId: true;
        characterKey: true;
        match: {
            select: {
                createdAt: true;
            };
        };
        character: {
            select: {
                releaseDate: true;
            };
        };
        randomMoveContext: true;
    };
}>;

type MatchTacticalUsageDTO = Prisma.MatchTacticalUsageGetPayload<{
    select: {
        setupNumber: true;
        characterKey: true;
        teamMember: {
            select: {
                teamId: true;
                team: {
                    select: {
                        matchId: true;
                    };
                };
            };
        };
    };
}>;

