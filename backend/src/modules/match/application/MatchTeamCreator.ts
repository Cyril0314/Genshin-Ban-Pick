// backend/src/modules/match/application/MatchTeamCreator.ts

import { Prisma } from "@prisma/client";

import { ITeam } from "../../../types/ITeam.ts";

export class MatchTeamCreator {
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
