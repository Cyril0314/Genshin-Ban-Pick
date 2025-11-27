// backend/src/modules/analyses/application/tactical/calculateTacticalWeight.ts

import { ITacticalCoefficients, DEFAULT_TACTICAL_COEFFICIENTS } from './types/ITacticalCoefficients';
import { IBanContext, IPickContext, IUtilityContext, IWeightContext } from './types/IWeightContext';

export function calculateTacticalWeight(ctx: IWeightContext, c: ITacticalCoefficients = DEFAULT_TACTICAL_COEFFICIENTS): number {
    if (ctx.ban.total > 0) return calcBanWeight(ctx.ban, c);
    if (ctx.pick.total > 0) return calcPickWeight(ctx.pick, c);
    if (ctx.utility.total > 0) return calcUtilityWeight(ctx.utility, c);
    return 0;
}

function calcBanWeight(ctx: IBanContext, c: ITacticalCoefficients): number {
    let w = c.ban.base;
    if (ctx.random > 0) {
        const rf = c.ban.randomFactor;
        w = w * (1 - rf) + c.ban.random * rf;
    }
    return clamp(w, c.clampRange);
}

function calcPickWeight(ctx: IPickContext, c: ITacticalCoefficients): number {
    let w = c.pick.base;

    if (ctx.randomUsed + ctx.randomNotUsed > 0) {
        const rf = c.pick.randomFactor;
        w = w * (1 - rf) + c.pick.random * rf;
    }

    if (ctx.manualNotUsed + ctx.randomNotUsed > 0) {
        w *= c.pick.notUsedFactor;
    }

    return clamp(w, c.clampRange);
}

function calcUtilityWeight(ctx: IUtilityContext, c: ITacticalCoefficients): number {
    let w = c.utility.base;

    const isRandom = ctx.randomNotUsed + ctx.randomUsedOneSide + ctx.randomUsedBothSides > 0;
    const usedOneSide = ctx.manualUsedOneSide + ctx.randomUsedOneSide > 0;
    const usedBoth = ctx.manualUsedBothSides + ctx.randomUsedBothSides > 0;

    if (isRandom) {
        const rf = c.utility.randomFactor;
        w = w * (1 - rf) + c.utility.random * rf;
    }

    if (usedOneSide) w *= c.utility.usedOneSideFactor;
    else if (usedBoth) w *= c.utility.usedBothSidesFactor;

    return clamp(w, c.clampRange);
}

function clamp(val: number, [min, max] = [0, 1.5]) {
    return Math.max(min, Math.min(max, val));
}
