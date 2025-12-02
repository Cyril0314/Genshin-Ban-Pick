import type { IPlayerStyleStats } from "@shared/contracts/analysis/IPlayerStyleStats";
import type { IMatchMoveWithCharacter } from "../../types/IMatchMoveWithCharacter";
import type { IMatchMoveWeightCalcCore } from "../../types/IMatchMoveWeightCalcCore";

export function computePlayerStyle(memberMatchMoves: IMatchMoveWithCharacter[], allMatchMoves: IMatchMoveWeightCalcCore[]): IPlayerStyleStats {
    const totalPicks = memberMatchMoves.length;

        if (totalPicks === 0) {
            return { aggression: 0, support: 0, versatility: 0, metaAffinity: 0, elementBias: 0 };
        }

        // 1. Aggression (DPS Ratio)
        const dpsCount = memberMatchMoves.filter((m) => m.character.role === 'MainDPS' || m.character.role === 'SubDPS').length;
        const aggression = (dpsCount / totalPicks) * 100;

        // 2. Support (Support Ratio)
        const supportCount = memberMatchMoves.filter((m) => m.character.role === 'Support').length;
        const support = (supportCount / totalPicks) * 100;

        // 3. Versatility (Unique Characters)
        const uniqueChars = new Set(memberMatchMoves.map((m) => m.characterKey)).size;
        const versatility = Math.min((uniqueChars / 20) * 100, 100);

        // 4. Meta Affinity (Global Pick Rate)
        const globalPickCounts: Record<string, number> = {};
        let globalTotalPicks = 0;
        allMatchMoves.forEach((m) => {
            if (m.type === 'Pick') {
                globalPickCounts[m.characterKey] = (globalPickCounts[m.characterKey] || 0) + 1;
                globalTotalPicks++;
            }
        });

        let totalMetaScore = 0;
        memberMatchMoves.forEach((m) => {
            const count = globalPickCounts[m.characterKey] || 0;
            const rate = globalTotalPicks > 0 ? count / globalTotalPicks : 0;
            totalMetaScore += rate;
        });

        const maxPickCount = Math.max(...Object.values(globalPickCounts), 1);
        const maxPickRate = maxPickCount / globalTotalPicks;
        const avgPickRate = totalMetaScore / totalPicks;
        const metaAffinity = maxPickRate > 0 ? (avgPickRate / maxPickRate) * 100 : 0;

        // 5. Element Bias (Entropy)
        const elementCounts: Record<string, number> = {};
        memberMatchMoves.forEach((m) => {
            const el = m.character.element;
            elementCounts[el] = (elementCounts[el] || 0) + 1;
        });

        let entropy = 0;
        Object.values(elementCounts).forEach((count) => {
            const p = count / totalPicks;
            entropy -= p * Math.log2(p);
        });

        const maxEntropy = Math.log2(7); // 7 elements
        const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;
        const elementBias = (1 - normalizedEntropy) * 100;

        return {
            aggression,
            support,
            versatility,
            metaAffinity,
            elementBias,
        };
}