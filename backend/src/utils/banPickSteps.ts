// backend/src/banPickSteps.ts

import { IBanPickStep } from '../types/IBanPickStep.ts'
import { ITeam } from '../types/ITeam.ts';
import { IZone } from '../types/IZone.ts';

export function generateBanPickSteps(
    banZones: IZone[],
    leftPickZones: IZone[],
    rightPickZones: IZone[],
    totalRounds: number,
    teams: ITeam[],
): IBanPickStep[] {
    const flow: IBanPickStep[] = [];
    let index = 0;

    const banPerRound = banZones.length / totalRounds;
    const pickPerRound = leftPickZones.length / totalRounds; // 左右一定相等

    const orderedBans = [...banZones].sort((a, b) => a.order - b.order);
    const orderedLeft = [...leftPickZones].sort((a, b) => a.order - b.order);
    const orderedRight = [...rightPickZones].sort((a, b) => a.order - b.order);

    const banRounds = splitByRounds(orderedBans, totalRounds) as IZone[][]
    const pickRoundsL = splitByRounds(orderedLeft, totalRounds) as IZone[][]
    const pickRoundsR = splitByRounds(orderedRight, totalRounds) as IZone[][]

    for (let round = 0; round < totalRounds; round++) {
        const startBan = round * banPerRound;
        const roundBanZones = banRounds[round];
        // const roundBanZones = orderedBans.slice(startBan, startBan + banPerRound);

        // ✅ 左右互選 BAN
        flow.push(
            ...roundBanZones.map((zone, i) => ({
                index: index++,
                teamId: teams[(round + i + 1) % 2].id,
                zoneId: zone.id,
            })),
        );

        const startPick = round * pickPerRound;
        const roundPickZonesL = pickRoundsL[round];
        // const leftRound = orderedLeft.slice(startPick, startPick + pickPerRound);
        const roundPickZonesR = pickRoundsR[round];
        // const rightRound = orderedRight.slice(startPick, startPick + pickPerRound);

        // ✅ 蛇行 PICK：偶數 Round A/B/B/A，奇數 Round 反轉
        const isOddRound = round % 2 === 1;

        for (let i = 0; i < pickPerRound; i += 2) {
            const l1 = roundPickZonesL[i];
            const l2 = roundPickZonesL[i + 1];
            const r1 = roundPickZonesR[i];
            const r2 = roundPickZonesR[i + 1];

            if (!isOddRound) {
                if (l1) flow.push({ index: index++, teamId: teams[0].id, zoneId: l1.id });
                if (r1) flow.push({ index: index++, teamId: teams[1].id, zoneId: r1.id });
                if (r2) flow.push({ index: index++, teamId: teams[1].id, zoneId: r2.id });
                if (l2) flow.push({ index: index++, teamId: teams[0].id, zoneId: l2.id });
            } else {
                if (r1) flow.push({ index: index++, teamId: teams[1].id, zoneId: r1.id });
                if (l1) flow.push({ index: index++, teamId: teams[0].id, zoneId: l1.id });
                if (l2) flow.push({ index: index++, teamId: teams[0].id, zoneId: l2.id });
                if (r2) flow.push({ index: index++, teamId: teams[1].id, zoneId: r2.id });
            }
        }
    }

    return flow;
}

function splitByRounds(items: any[], rounds: number) {
    const base = Math.floor(items.length / rounds)
    const remainder = items.length % rounds

    return Array.from({ length: rounds }, (_, i) =>
        items.slice(
            i * base + Math.min(i, remainder),
            (i + 1) * base + Math.min(i + 1, remainder),
        )
    )
}