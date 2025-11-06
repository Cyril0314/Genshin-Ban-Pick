// backend/src/matchFlow.ts

import { IMatchStep } from '../types/IMatchFlow.ts';
import { ITeam } from '../types/ITeam.ts';
import { IZone, ZoneType } from '../types/IZone.ts';
import { InvalidRoomSetting } from '../errors/AppError.ts';
import { createLogger } from './logger.ts';

const logger = createLogger('BAN PICK STEPS');

export function generateMatchFlow(
    flowVersion: number,
    zoneMetaTable: Record<string, IZone>,
    totalRounds: number,
    teams: ITeam[],
): {
    version: number;
    steps: IMatchStep[];
} {
    const steps: IMatchStep[] = [];
    let index = 0;

    const utilityZones = Object.values(zoneMetaTable)
        .filter((zone) => zone.type === ZoneType.Utility)
        .sort((a, b) => a.order - b.order);
    const banZones = Object.values(zoneMetaTable)
        .filter((zone) => zone.type === ZoneType.Ban)
        .sort((a, b) => a.order - b.order);
    const pickZones = Object.values(zoneMetaTable)
        .filter((zone) => zone.type === ZoneType.Pick)
        .sort((a, b) => a.order - b.order);

    const banZoneRounds = splitZonesByRound(banZones, totalRounds);
    const pickZoneRounds = splitZonesByRound(pickZones, totalRounds);

    logger.debug(`Split ban zone rounds`, banZoneRounds);
    logger.debug(`Split pick zone rounds`, pickZoneRounds);

    steps.push(
        ...utilityZones.map((zone, i) => {
            const isOdd = i % 2 === 1;
            const isFirstTeamStep = !isOdd;
            const teamSlot = isFirstTeamStep ? teams[0].slot : teams[1].slot;
            return {
                index: index++,
                teamSlot,
                zoneId: zone.id,
            };
        }),
    );

    for (let round = 0; round < totalRounds; round++) {
        const isOddRound = round % 2 === 1;

        const banZones = banZoneRounds[round];
        // 左右互選 BAN：偶數 Round B/A/B/A，奇數 Round 反轉
        steps.push(
            ...banZones.map((zone, i) => {
                const isOdd = i % 2 === 1;
                const isFirstTeamStep = (!isOddRound && isOdd) || (isOddRound && !isOdd);
                const teamSlot = isFirstTeamStep ? teams[0].slot : teams[1].slot;

                return {
                    index: index++,
                    teamSlot,
                    zoneId: zone.id,
                };
            }),
        );

        const pickZones = pickZoneRounds[round];
        // 蛇行 PICK：偶數 Round A/B/B/A，奇數 Round 反轉
        steps.push(
            ...pickZones.map((zone, i) => {
                const mod = i % 4;
                const isFirstTeamStep = (!isOddRound && (mod === 0 || mod === 3)) || (isOddRound && !(mod === 0 || mod === 3));
                const teamSlot = isFirstTeamStep ? teams[0].slot : teams[1].slot;

                return {
                    index: index++,
                    teamSlot,
                    zoneId: zone.id,
                };
            }),
        );
    }
    logger.debug(`Generate ban pick steps`, steps);
    return { version: flowVersion, steps };
}

function splitZonesByRound(zones: IZone[], totalRounds: number): IZone[][] {
    const total = zones.length;

    // 確保總數為偶數（蛇行/互選通常要求偶數
    if (total % 2 !== 0) {
        throw new InvalidRoomSetting();
    }

    const base = Math.floor(total / totalRounds); // 例如 52/3 => 17
    const baseEven = base - (base % 2); // 壓成偶數：17 -> 16
    let remaining = total - baseEven * totalRounds; // 52 - 16*3 = 4

    // 先給每個回合一個偶數基準
    const counts = Array.from({ length: totalRounds }, () => baseEven);

    // 依序分配多出的
    for (let i = 0; i < totalRounds && remaining > 0; i++) {
        const give = Math.min(2, remaining);
        counts[i] += give;
        remaining -= give;
    }

    // 依 counts 切片
    const result: IZone[][] = [];
    let start = 0;
    for (let i = 0; i < totalRounds; i++) {
        const end = start + counts[i];
        result.push(zones.slice(start, end));
        start = end;
    }

    return result;
}
