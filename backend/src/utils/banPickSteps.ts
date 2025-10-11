// backend/src/banPickSteps.ts

import { numberOfBan, numberOfPick, totalRounds, teams } from '../constants/constants.ts';
import { IBanPickStep } from '../types/IBanPickStep.ts'
import { ITeam } from '../types/ITeam.ts';

export const banPickSteps: IBanPickStep[] = generateBanPickSteps(numberOfBan, numberOfPick, teams, totalRounds);

function generateBanPickSteps(banCount: number, pickCount: number, teams: ITeam[], totalRounds: number): IBanPickStep[] {
    const flow: IBanPickStep[] = [];

    const frontBan = Math.ceil(banCount / totalRounds);
    const backBan = Math.floor(banCount / totalRounds);

    const halfPick = Math.floor(pickCount / totalRounds);
    const restPick = pickCount - halfPick;

    flow.push(
        ...generateAlternateBanFlow(
            1,
            frontBan,
            teams[1],
            teams[0],
        )
    );
    flow.push(
        ...generateSnakePickFlow(
            1,
            halfPick,
            teams[0],
            teams[1],
        )
    );
    flow.push(
        ...generateAlternateBanFlow(
            frontBan + 1,
            backBan,
            teams[0],
            teams[1],
        )
    );
    flow.push(
        ...generateSnakePickFlow(
            halfPick + 1,
            restPick,
            teams[1],
            teams[0],
        )
    );

    return flow;
}

function generateAlternateBanFlow(startIndex: number, banCount: number, firstTeam: ITeam, secondTeam: ITeam): IBanPickStep[] {
    const teams = [firstTeam, secondTeam];

    return Array.from({ length: banCount }, (_, i) => ({
        team: teams[i % 2],
        zoneId: `zone-ban-${startIndex + i}`,
        action: 'ban',
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
            zoneId: `zone-pick-${current++}`,
            action: 'pick',
        });
        picks.push({
            team: teams[1],
            zoneId: `zone-pick-${current++}`,
            action: 'pick',
        });
        picks.push({
            team: teams[1],
            zoneId: `zone-pick-${current++}`,
            action: 'pick',
        });
        picks.push({
            team: teams[0],
            zoneId: `zone-pick-${current++}`,
            action: 'pick',
        });
    }

    return picks;
}