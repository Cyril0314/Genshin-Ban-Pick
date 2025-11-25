// backend/src/modules/match/application/MatchCreator.ts

import { Prisma } from '@prisma/client';

export class MatchCreator {
    static async createMatch(tx: Prisma.TransactionClient, flowVersion: number) {
        const match = await tx.match.create({
            data: {
                flowVersion,
            },
        });
        return match;
    }
}
