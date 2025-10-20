// backend/src/banPickSteps.ts

import { IBanPickStep } from '../types/IBanPickStep.ts'
import { ITeam } from '../types/ITeam.ts';
import { IZone } from '../types/IZone.ts';

export function generateBanPickSteps(banZones: IZone[], leftPickZones: IZone[], rightPickZones: IZone[], totalRounds: number, teams: ITeam[]): IBanPickStep[] {
    const flow: IBanPickStep[] = [];

    const frontBan = Math.ceil(banZones.length / totalRounds);
    const backBan = Math.floor(banZones.length / totalRounds);

    const pickZoneCount = leftPickZones.length + rightPickZones.length
    const halfPick = Math.floor(pickZoneCount / totalRounds);
    const restPick = pickZoneCount - halfPick;

    const frontTeam = teams[0]
    const backTeam = teams[1]

    const orderedBanZones = [...banZones].sort((a, b) => a.order - b.order)
    const frontBanZones = orderedBanZones.slice(0, frontBan)
    const backBanZones = orderedBanZones.slice(frontBan, banZones.length)

    const orderedLeftPickZones = [...leftPickZones].sort((a, b) => a.order - b.order)
    const orderedRightPickZones = [...rightPickZones].sort((a, b) => a.order - b.order)

    const halfLeftPick = Math.ceil(orderedLeftPickZones.length / totalRounds);
    const frontLeftPickZones = orderedLeftPickZones.slice(0, halfLeftPick)
    const backLeftPickZones = orderedLeftPickZones.slice(halfLeftPick, orderedLeftPickZones.length)

    const halfRightPick = Math.ceil(orderedRightPickZones.length / totalRounds);
    const frontRightPickZones = orderedRightPickZones.slice(0, halfRightPick)
    const backRightPickZones = orderedRightPickZones.slice(halfRightPick, orderedRightPickZones.length)

    var index: number = 0

    flow.push(
        ...generateAlternateBanFlow(
            index,
            frontBanZones,
            [backTeam, frontTeam],
        )
    );

    index = index + frontBanZones.length

    flow.push(
        ...generateSnakePickFlow(
            index,
            [frontLeftPickZones, frontRightPickZones],
            [frontTeam, backTeam],
        )
    );

    index = index + frontLeftPickZones.length + frontRightPickZones.length

    flow.push(
        ...generateAlternateBanFlow(
            index,
            backBanZones,
            [frontTeam, backTeam],
        )
    );

    index = index + backBanZones.length

    flow.push(
        ...generateSnakePickFlow(
            index,
            [backRightPickZones, backLeftPickZones],
            [backTeam, frontTeam],
        )
    );

    console.log(`flow ${JSON.stringify(flow, null, 2)}`)
    return flow;
}

function generateAlternateBanFlow(startIndex: number, banZones: IZone[], teams: ITeam[]): IBanPickStep[] {
    return Array.from({ length: banZones.length }, (_, i) => ({
        index: startIndex + i,
        teamId: teams[i % 2].id,
        zoneId: banZones[i].id
    }));
}

function generateSnakePickFlow(startIndex: number, zoneMatrix: [IZone[], IZone[]], teams: ITeam[]): IBanPickStep[] {
    if (zoneMatrix[0].length !== zoneMatrix[1].length) return []
    const pickCount = zoneMatrix[0].length

    const picks: IBanPickStep[] = [];
    let current = startIndex;

    for (let i = 0; i < pickCount - 1; i += 2) {
        const l1 = zoneMatrix[0][i]
        const l2 = zoneMatrix[0][i + 1]
        const r1 = zoneMatrix[1][i]
        const r2 = zoneMatrix[1][i + 1]
        if (!l1 || !l2 || !r1 || !r2) break

        picks.push({ index: current++, teamId: teams[0].id, zoneId: l1.id })
        picks.push({ index: current++, teamId: teams[1].id, zoneId: r1.id })
        picks.push({ index: current++, teamId: teams[1].id, zoneId: r2.id })
        picks.push({ index: current++, teamId: teams[0].id, zoneId: l2.id })
    }

    return picks;
}


// export function generateBanPickSteps(banCount: number, pickCount: number, teams: ITeam[], totalRounds: number): IBanPickStep[] {
//     const flow: IBanPickStep[] = [];

//     const frontBan = Math.ceil(banCount / totalRounds);
//     const backBan = Math.floor(banCount / totalRounds);

//     const halfPick = Math.floor(pickCount / totalRounds);
//     const restPick = pickCount - halfPick;

//     const frontTeam = teams[0]
//     const backTeam = teams[1]

//     flow.push(
//         ...generateAlternateBanFlow(
//             1,
//             frontBan,
//             backTeam,
//             frontTeam,
//         )
//     );
//     flow.push(
//         ...generateSnakePickFlow(
//             1,
//             halfPick,
//             frontTeam,
//             backTeam,
//         )
//     );
//     flow.push(
//         ...generateAlternateBanFlow(
//             frontBan + 1,
//             backBan,
//             frontTeam,
//             backTeam,
//         )
//     );
//     flow.push(
//         ...generateSnakePickFlow(
//             halfPick + 1,
//             restPick,
//             backTeam,
//             frontTeam,
//         )
//     );

//     return flow;
// }

// function generateAlternateBanFlow(startIndex: number, banCount: number, firstTeam: ITeam, secondTeam: ITeam): IBanPickStep[] {
//     const teams = [firstTeam, secondTeam];

//     return Array.from({ length: banCount }, (_, i) => ({
//         team: teams[i % 2],
//         zone: { id: startIndex + i, type: ZoneType.BAN }
//     }));
// }

// function generateSnakePickFlow(startIndex: number, pickCount: number, firstTeam: ITeam, secondTeam: ITeam): IBanPickStep[] {
//     const picks: IBanPickStep[] = [];
//     const teams = [firstTeam, secondTeam];
//     let current = startIndex;
//     const pairRounds = Math.floor(pickCount / 4);

//     for (let i = 0; i < pairRounds; i++) {
//         picks.push({
//             team: teams[0],
//             zone: { id: current++, type: ZoneType.PICK }
//         });
//         picks.push({
//             team: teams[1],
//             zone: { id: current++, type: ZoneType.PICK }
//         });
//         picks.push({
//             team: teams[1],
//             zone: { id: current++, type: ZoneType.PICK }
//         });
//         picks.push({
//             team: teams[0],
//             zone: { id: current++, type: ZoneType.PICK }
//         });
//     }

//     return picks;
// }