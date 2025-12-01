// src/modules/analysis/registerAnalysisDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import AnalysisUseCase from './application/AnalysisUseCase';
import AnalysisRepository from './infrastructure/AnalysisRepository';
import AnalysisService from './infrastructure/AnalysisService';

import type { HttpClient } from '../../app/infrastructure/http/httpClient';
import type { App } from 'vue';

export function registerAnalysisDependencies(app: App, httpClient: HttpClient) {
    const analysisService = new AnalysisService(httpClient)
    const analysisRepository = new AnalysisRepository(analysisService)
    const analysisUseCase = new AnalysisUseCase(analysisRepository)

    app.provide(DIKeys.AnalysisUseCase, analysisUseCase);
}
