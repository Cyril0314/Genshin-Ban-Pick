// src/modules/player/registerPlayerDependencies.ts

import PlayerUseCase from './application/PlayerUseCase';
import PlayerRepository from './infrastructure/PlayerRepository';
import PlayerService from './infrastructure/PlayerService';

import type { HttpClient } from '../../app/infrastructure/http/httpClient';
import type { App } from 'vue';

import { DIKeys } from '@/app/constants/diKeys';

export function registerPlayerDependencies(app: App, httpClient: HttpClient) {
    const playerService = new PlayerService(httpClient);
    const playerRepository = new PlayerRepository(playerService);
    const playerUseCase = new PlayerUseCase(playerRepository);

    app.provide(DIKeys.PlayerUseCase, playerUseCase);
}
