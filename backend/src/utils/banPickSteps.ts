// backend/src/banPickSteps.ts

import { IBanPickStep } from '../types/IBanPickStep.ts'
import { ITeam } from '../types/ITeam.ts';
import { ZoneType } from '../types/IZone.ts';

export function generateBanPickSteps(banCount: number, pickCount: number, teams: ITeam[], totalRounds: number): IBanPickStep[] {
    const flow: IBanPickStep[] = [];

    const frontBan = Math.ceil(banCount / totalRounds);
    const backBan = Math.floor(banCount / totalRounds);

    const halfPick = Math.floor(pickCount / totalRounds);
    const restPick = pickCount - halfPick;

    const firstTeam = teams[0]
    const secondTeam = teams[1]

    flow.push(
        ...generateAlternateBanFlow(
            1,
            frontBan,
            secondTeam,
            firstTeam,
        )
    );
    flow.push(
        ...generateSnakePickFlow(
            1,
            halfPick,
            firstTeam,
            secondTeam,
        )
    );
    flow.push(
        ...generateAlternateBanFlow(
            frontBan + 1,
            backBan,
            firstTeam,
            secondTeam,
        )
    );
    flow.push(
        ...generateSnakePickFlow(
            halfPick + 1,
            restPick,
            secondTeam,
            firstTeam,
        )
    );

    return flow;
}

function generateAlternateBanFlow(startIndex: number, banCount: number, firstTeam: ITeam, secondTeam: ITeam): IBanPickStep[] {
    const teams = [firstTeam, secondTeam];

    return Array.from({ length: banCount }, (_, i) => ({
        team: teams[i % 2],
        zone: { id: startIndex + i, zoneType: ZoneType.BAN }
    }));
}

function generateSnakePickFlow(startIndex: number, pickCount: number, firstTeam: ITeam, secondTeam: ITeam): IBanPickStep[] {
    const picks: IBanPickStep[] = [];
    const teams = [firstTeam, secondTeam];
    let current = startIndex;
    const pairRounds = Math.floor(pickCount / 4);

    for (let i = 0; i < pairRounds; i++) {
        picks.push({
            team: teams[0],
            zone: { id: current++, zoneType: ZoneType.PICK }
        });
        picks.push({
            team: teams[1],
            zone: { id: current++, zoneType: ZoneType.PICK }
        });
        picks.push({
            team: teams[1],
            zone: { id: current++, zoneType: ZoneType.PICK }
        });
        picks.push({
            team: teams[0],
            zone: { id: current++, zoneType: ZoneType.PICK }
        });
    }

    return picks;
}