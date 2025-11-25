// backend/src/modules/match/application/MatchMoveCreator.ts

import { Prisma } from '@prisma/client';
import { IMatchStep } from '../domain/IMatchFlow.ts';
import { IZone } from '../../../types/IZone.ts';
import { BoardImageMap, CharacterRandomContextMap } from '../../room/index.ts';

export class MatchMoveCreator {
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
            const matchTeamId = step.teamSlot === null ? null : matchTeamIdMap[step.teamSlot];
            const zone = zoneMetaTable[step.zoneId];
            const characterKey = boardImageMap[step.zoneId];

            const randomContext = characterRandomContextMap[characterKey] ?? null;
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
