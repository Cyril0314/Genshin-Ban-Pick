// src/modules/player/infrastructure/PlayerRepository.ts

import { toPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';

import type PlayerService from './PlayerService';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';
import type { IPlayerMatchSummary } from '@shared/contracts/player/IPlayerMatchSummary';
import type { IPlayerTeammate } from '@shared/contracts/player/IPlayerTeammate';

export default class PlayerRepository {
    constructor(private playerService: PlayerService) {}

    async fetchPlayerRecord(playerIdentity: PlayerIdentity) {
        const response = await this.playerService.getPlayerRecord(toPlayerIdentityQuery(playerIdentity));
        return response.data;
    }

    async fetchPlayerMatches(playerIdentity: PlayerIdentity): Promise<IPlayerMatchSummary[]> {
        const response = await this.playerService.getPlayerMatches(toPlayerIdentityQuery(playerIdentity));
        return response.data.map((summary: any) => ({
            ...summary,
            createdAt: new Date(summary.createdAt),
        }));
    }

    async fetchPlayerTeammates(playerIdentity: PlayerIdentity): Promise<IPlayerTeammate[]> {
        const response = await this.playerService.getPlayerTeammates(toPlayerIdentityQuery(playerIdentity));
        return response.data;
    }
}
