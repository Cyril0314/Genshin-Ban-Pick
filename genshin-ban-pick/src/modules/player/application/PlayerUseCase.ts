// src/modules/player/application/PlayerUseCase.ts

import type PlayerRepository from '../infrastructure/PlayerRepository';
import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

export default class PlayerUseCase {
    constructor(private playerRepository: PlayerRepository) {}

    async fetchPlayers() {
        return await this.playerRepository.fetchPlayers();
    }

    async fetchPlayerRecord(playerIdentity: PlayerIdentity) {
        return await this.playerRepository.fetchPlayerRecord(playerIdentity);
    }

    async fetchPlayerMatches(playerIdentity: PlayerIdentity) {
        return await this.playerRepository.fetchPlayerMatches(playerIdentity);
    }

    async fetchPlayerTeammates(playerIdentity: PlayerIdentity) {
        return await this.playerRepository.fetchPlayerTeammates(playerIdentity);
    }
}
