// backend/src/modules/analysis/application/tactical/getWeightContext.ts

import { MoveType, MoveSource } from '@prisma/client';
import { IWeightContext } from './types/IWeightContext';
import { IMoveContext } from './types/IMoveContext';

export function getWeightContext(move: IMoveContext): IWeightContext {
    const ctx: IWeightContext = {
        pick: {
            total: 0,
            manualUsed: 0,
            manualNotUsed: 0,
            randomUsed: 0,
            randomNotUsed: 0,
        },
        ban: {
            total: 0,
            manual: 0,
            random: 0,
        },
        utility: {
            total: 0,
            manualNotUsed: 0,
            manualUsedOneSide: 0,
            manualUsedBothSides: 0,
            randomNotUsed: 0,
            randomUsedOneSide: 0,
            randomUsedBothSides: 0,
        },
    };

    const { type, source, wasUsed, usedByBothTeams } = move;
    const isRandom = source === MoveSource.Random;

    switch (type) {
        case MoveType.Ban:
            ctx.ban.total++;
            isRandom ? ctx.ban.random++ : ctx.ban.manual++;
            break;

        case MoveType.Pick:
            ctx.pick.total++;
            if (!isRandom && wasUsed) ctx.pick.manualUsed++;
            else if (!isRandom && !wasUsed) ctx.pick.manualNotUsed++;
            else if (isRandom && wasUsed) ctx.pick.randomUsed++;
            else ctx.pick.randomNotUsed++;
            break;

        case MoveType.Utility:
            ctx.utility.total++;
            if (!isRandom && !wasUsed) ctx.utility.manualNotUsed++;
            else if (!isRandom && wasUsed && !usedByBothTeams) ctx.utility.manualUsedOneSide++;
            else if (!isRandom && wasUsed && usedByBothTeams) ctx.utility.manualUsedBothSides++;
            else if (isRandom && !wasUsed) ctx.utility.randomNotUsed++;
            else if (isRandom && wasUsed && !usedByBothTeams) ctx.utility.randomUsedOneSide++;
            else ctx.utility.randomUsedBothSides++;
            break;
    }

    return ctx;
}
