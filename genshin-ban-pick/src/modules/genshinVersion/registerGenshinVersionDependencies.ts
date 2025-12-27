// src/modules/genshinVersion/registerGenshinVersionDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import GenshinVersionUseCase from './application/GenshinVersionUseCase';
import GenshinVersionRepository from './infrastructure/GenshinVersionRepository';
import GenshinVersionService from './infrastructure/GenshinVersionService';
import type { HttpClient } from '../../app/infrastructure/http/httpClient';
import type { App } from 'vue';

export function registerGenshinVersionDependencies(app: App, httpClient: HttpClient) {
    const genshinVersionService = new GenshinVersionService(httpClient)
    const genshinVersionRepository = new GenshinVersionRepository(genshinVersionService)
    const genshinVersionUseCase = new GenshinVersionUseCase(genshinVersionRepository)

    app.provide(DIKeys.GenshinVersionUseCase, genshinVersionUseCase);
}
