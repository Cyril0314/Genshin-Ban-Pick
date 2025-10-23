// backend/src/ZoneSchema.ts

import { IZone, ZoneType } from '../types/IZone.ts';

export function createZoneSchema({
    numberOfUtility,
    maxPerUtilityColumn,
    numberOfBan,
    maxPerBanRow,
    numberOfPick,
    maxPerPickColumn,
    totalRounds,
}: {
    numberOfUtility: number;
    maxPerUtilityColumn: number;
    numberOfBan: number;
    maxPerBanRow: number;
    numberOfPick: number;
    maxPerPickColumn: number;
    totalRounds: number;
}) {
    var id = 0;
    const utilityOrders = generateUtilityOrder(numberOfUtility);
    const utilityZones: IZone[] = utilityOrders.map((order) => {
        return { id: id++, type: ZoneType.UTILITY, order: order };
    });
    // console.log(`utilityZones ${JSON.stringify(utilityZones, null, 2)}`)

    const banOrders = generateBanOrder(numberOfBan, maxPerBanRow, totalRounds);
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
        banZones,
        leftPickZones,
        rightPickZones,
    };
}

function generateUtilityOrder(num: number): number[] {
    return Array.from({ length: num }, (_, i) => i);
}

function generateBanOrder(num: number, maxPerRow: number, totalRounds: number): number[] {
    const roundOffset = num / totalRounds;
    const rows = Math.ceil(num / maxPerRow);
    const matrix: number[][] = Array.from({ length: rows }, () => []);

    const shouldUnshift = (i: number) => {
        const isFirstHalf = i < roundOffset;
        const isOdd = i % 2 === 1;
        return (isFirstHalf && isOdd) || (!isFirstHalf && !isOdd);
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


// function generatePickOrder2(num: number, maxPerPickColumn: number, totalRounds: number): { left: number[]; right: number[] } {
//     const offset = num / totalRounds;
//     const columns = Math.ceil(num / maxPerPickColumn);
//     const matrix: number[][] = Array.from({ length: columns }, () => []);

//     const teamCount = 2
//     const perTeamColumn = columns / teamCount

    
//     // var offensive: number[] = [];
//     // let defensive: number[] = [1, 2, 5, 6, 9, 10, 13, 14];

//     let column

//     // for (let i = 0; i < offset; i++) {
//         for (let j = 0; j < num / teamCount; j += teamCount) {
//             // 0 2 4 6 8 10 12 14
//             if (j < offset) {
//                 matrix[0].push(j)
//                 matrix[0 + teamCount].push(j + 1)
//             } else {

//             }
            
//         }
//     // }

    
//     // const matrix: number[][] = [[], [], [], []];

//     offensive.forEach((p) => {
//         matrix[0].push(p);
//         matrix[2].push(offset + p);
//     });
//     defensive.forEach((p) => {
//         matrix[1].push(offset + p);
//         matrix[3].push(p);
//     });

//     const flat = matrix.flat();

//     return {
//         left: flat.slice(0, num / 2),
//         right: flat.slice(num / 2),
//     };
// }

function generatePickOrder(num: number, totalRounds: number): { left: number[]; right: number[] } {
    const offset = num / totalRounds;
    const offensive: number[] = [0, 3, 4, 7, 8, 11, 12, 15];
    const defensive: number[] = [1, 2, 5, 6, 9, 10, 13, 14];
    const matrix: number[][] = [[], [], [], []];

    offensive.forEach((p) => {
        matrix[0].push(p);
        matrix[3].push(offset + p);
    });
    defensive.forEach((p) => {
        matrix[1].push(offset + p);
        matrix[2].push(p);
    });

    const flat = matrix.flat();

    return {
        left: flat.slice(0, num / 2),
        right: flat.slice(num / 2),
    };
}
