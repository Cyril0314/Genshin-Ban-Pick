// backend/src/modules/match/application/creators/MatchTeamCreator.ts

import { Prisma } from "@prisma/client";

import type { ITeam } from '@shared/contracts/team/ITeam';

export default class MatchTeamCreator {
    static async createMatchTeams(tx: Prisma.TransactionClient, matchId: number, teams: ITeam[]) {
        const matchTeams = await Promise.all(
            teams.map((team) =>
                tx.matchTeam.create({
                    data: {
                        slot: team.slot,
                        name: team.name,
                        matchId,
                    },
                }),
            ),
        );

        return matchTeams;
    }
}
