// backend/src/modules/analysis/infra/statistics/computePlayerStyle.ts

import { Element, Weapon } from "@shared/contracts/character/value-types";

import type { IPlayerStyleStats } from "@shared/contracts/analysis/IPlayerStyleStats";
import type { IMatchTacticalUsageWithCharacter } from "../../types/IMatchTacticalUsageWithCharacter";

export function computePlayerStyle(memberUsages: IMatchTacticalUsageWithCharacter[], allUsuages: IMatchTacticalUsageWithCharacter[]): IPlayerStyleStats {
    const totalPicks = memberUsages.length;

        if (totalPicks === 0) {
            return { aggression: 0, support: 0, versatility: 0, metaAffinity: 0, elementBias: 0, weaponBias: 0 };
        }

        // 1. Aggression (DPS Ratio)
        const dpsCount = memberUsages.filter((m) => m.character.role === 'MainDPS' || m.character.role === 'SubDPS').length;
        const aggression = (dpsCount / totalPicks) * 100;

        // 2. Support (Support Ratio)
        const supportCount = memberUsages.filter((m) => m.character.role === 'Support').length;
        const support = (supportCount / totalPicks) * 100;

        // 3. Versatility (Unique Characters)
        const uniqueChars = new Set(memberUsages.map((m) => m.characterKey)).size;
        const versatility = Math.min((uniqueChars / 30) * 100, 100);

        // 4. Meta Affinity (Global Pick Rate)
        const globalPickCounts: Record<string, number> = {};
        let globalTotalPicks = 0;
        allUsuages.forEach((m) => {
            globalPickCounts[m.characterKey] = (globalPickCounts[m.characterKey] || 0) + 1;
            globalTotalPicks++;
        });

        let totalMetaScore = 0;
        memberUsages.forEach((m) => {
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
        memberUsages.forEach((m) => {
            const el = m.character.element;
            elementCounts[el] = (elementCounts[el] || 0) + 1;
        });

        let elementEntropy = 0;
        Object.values(elementCounts).forEach((count) => {
            const p = count / totalPicks;
            elementEntropy -= p * Math.log2(p);
            console.log(`p`, p)
            console.log(`elementEntropy`, elementEntropy)
        });

        const maxElementEntropy = Math.log2(Object.values(Element).length); // 7 elements
        const normalizedElementEntropy = maxElementEntropy > 0 ? elementEntropy / maxElementEntropy : 0;
        const elementBias = (1 - normalizedElementEntropy) * 100;
        console.log(`elementCounts`, elementCounts)
        console.log(`maxElementEntropy`, maxElementEntropy)
        console.log(`normalizedElementEntropy`, normalizedElementEntropy)

        // 5. Weapon Bias (Entropy)
        const weaponCounts: Record<string, number> = {};
        memberUsages.forEach((m) => {
            const weapon = m.character.weapon;
            weaponCounts[weapon] = (weaponCounts[weapon] || 0) + 1;
        });

        let weaponEntropy = 0;
        Object.values(weaponCounts).forEach((count) => {
            const p = count / totalPicks;
            weaponEntropy -= p * Math.log2(p);
        });

        const maxWeaponEntropy = Math.log2(Object.values(Weapon).length); // 5 elements
        const normalizedWeaponEntropy = maxWeaponEntropy > 0 ? weaponEntropy / maxWeaponEntropy : 0;
        const weaponBias = (1 - normalizedWeaponEntropy) * 100;
        console.log(`weaponCounts`, weaponCounts)

        return {
            aggression,
            support,
            versatility,
            metaAffinity,
            elementBias,
            weaponBias,
        };
}