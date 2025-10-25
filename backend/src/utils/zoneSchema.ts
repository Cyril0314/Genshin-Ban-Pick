// backend/src/ZoneSchema.ts

import { IZone, ZoneType } from '../types/IZone.ts';

export function createZoneSchema({
    numberOfUtility,
    maxNumberOfUtilityPerColumn,
    numberOfBan,
    maxNumberOfBanPerRow,
    numberOfPick,
    maxNumberOfPickPerColumn,
    totalRounds,
}: {
    numberOfUtility: number;
    maxNumberOfUtilityPerColumn: number;
    numberOfBan: number;
    maxNumberOfBanPerRow: number;
    numberOfPick: number;
    maxNumberOfPickPerColumn: number;
    totalRounds: number;
}) {
    var id = 0;
    const utilityOrders = generateUtilityOrder(numberOfUtility);
    const utilityZones: IZone[] = utilityOrders.map((order) => {
        return { id: id++, type: ZoneType.UTILITY, order: order };
    });
    // console.log(`utilityZones ${JSON.stringify(utilityZones, null, 2)}`)

    const banOrders = generateBanOrder(numberOfBan, maxNumberOfBanPerRow, totalRounds);
    const banZones: IZone[] = banOrders.map((order) => {
        return { id: id++, type: ZoneType.BAN, order: order };
    });
    // console.log(`banZones ${JSON.stringify(banZones, null, 2)}`)

    const pickOrders = generatePickOrder(numberOfPick, totalRounds);
    const leftPickZones: IZone[] = pickOrders.left.map((order) => {
        return { id: id++, type: ZoneType.PICK, order: order };
    });
    const rightPickZones: IZone[] = pickOrders.right.map((order) => {
        return { id: id++, type: ZoneType.PICK, order: order };
    });
    // console.log(`leftPickZones ${JSON.stringify(leftPickZones, null, 2)}`)
    // console.log(`rightPickZones ${JSON.stringify(rightPickZones, null, 2)}`)

    const zones: IZone[] = [...utilityZones, ...banZones, ...leftPickZones, ...rightPickZones];
    const zoneMetaTable: Record<string, IZone> = Object.fromEntries(zones.map((zone) => [zone.id, zone]));
    // console.log(`zoneMetaTable ${JSON.stringify(zoneMetaTable, null, 2)}`)

    return {
        zoneMetaTable,
        utilityZones,
        maxNumberOfUtilityPerColumn,
        banZones,
        maxNumberOfBanPerRow,
        leftPickZones,
        rightPickZones,
        maxNumberOfPickPerColumn,
    };
}

function generateUtilityOrder(num: number): number[] {
    return Array.from({ length: num }, (_, i) => i);
}

function generateBanOrder(num: number, maxPerRow: number, totalRounds: number): number[] {
    const banPerRound = num / totalRounds;
    const rows = Math.ceil(num / maxPerRow);
    const matrix: number[][] = Array.from({ length: rows }, () => []);

    const shouldUnshift = (i: number) => {
        const roundIndex = Math.floor(i / banPerRound);
        const isOddRound = roundIndex % 2 === 1;
        const isOdd = i % 2 === 1;
        return (!isOddRound && isOdd) || (isOddRound && !isOdd);
    };

    let row = 0;
    for (let i = 0; i < num; i++) {
        if (shouldUnshift(i)) {
            matrix[row].unshift(i);
        } else {
            matrix[row].push(i);
        }
        if ((i + 1) % maxPerRow === 0) {
            row++;
        }
    }

    return matrix.flat();
}

function generatePickOrder(num: number, totalRounds: number): { left: number[]; right: number[] } {
    const picksPerRound = num / totalRounds;

    const left: number[] = [];
    const right: number[] = [];

    for (let i = 0; i < num; i++) {
        const roundIndex = Math.floor(i / picksPerRound);
        const mod = i % 4;
        const isOddRound = roundIndex % 2 === 1;

        if (!isOddRound) {
            // 偶數回合：A B B A
            if (mod === 0 || mod === 3) left.push(i);
            else right.push(i);
        } else {
            // 奇數回合：B A A B
            if (mod === 0 || mod === 3) right.push(i);
            else left.push(i);
        }
    }
    return { left, right }
}