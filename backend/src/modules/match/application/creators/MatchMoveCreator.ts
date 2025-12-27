// backend/src/modules/match/application/creators/MatchMoveCreator.ts

import { Prisma } from '@prisma/client';

import type { IZone } from '@shared/contracts/board/IZone';
import type { IMatchStep } from '@shared/contracts/match/IMatchStep';
import type { BoardImageMap } from '@shared/contracts/board/BoardImageMap';
import type { CharacterRandomContextMap } from '@shared/contracts/character/CharacterRandomContextMap';

export default class MatchMoveCreator {
    static async createMatchMoves(
        tx: Prisma.TransactionClient,
        matchId: number,
        steps: IMatchStep[],
        zoneMetaTable: Record<number, IZone>,
        boardImageMap: BoardImageMap,
        characterRandomContextMap: CharacterRandomContextMap,
        matchTeamIdMap: Record<number, number>,
    ) {
        const matchMoves = [];
        for (const step of steps) {
            const matchTeamId = step.teamSlot === undefined ? undefined : matchTeamIdMap[step.teamSlot];
            const zone = zoneMetaTable[step.zoneId];
            const characterKey = boardImageMap[step.zoneId];

            const randomContext = characterRandomContextMap[characterKey] ?? undefined;
            const matchMove = await tx.matchMove.create({
                data: {
                    order: step.index,
                    type: zone.type,
                    source: randomContext ? 'Random' : 'Manual',
                    matchId,
                    teamId: matchTeamId,
                    characterKey,
                },
            });

            if (randomContext) {
                await tx.randomMoveContext.create({
                    data: {
                        filters: randomContext.characterFilter,
                        matchMoveId: matchMove.id,
                    },
                });
            }

            matchMoves.push(matchMove);
        }
        return matchMoves
    }
}
