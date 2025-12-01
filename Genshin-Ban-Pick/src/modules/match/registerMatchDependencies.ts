// src/modules/match/registerMatchDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import MatchUseCase from './application/MatchUseCase';
import MatchRepository from './infrastructure/MatchRepository';
import MatchService from './infrastructure/MatchService';

import type { HttpClient } from '../../app/infrastructure/http/httpClient';
import type { App } from 'vue';

export function registerMatchDependencies(app: App, httpClient: HttpClient) {
    const matchService = new MatchService(httpClient)
    const matchRepository = new MatchRepository(matchService)
    const matchUseCase = new MatchUseCase(matchRepository)

    app.provide(DIKeys.MatchUseCase, matchUseCase);
}
