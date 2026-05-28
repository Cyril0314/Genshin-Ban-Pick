// src/modules/analysis/registerAnalysisDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import AnalysisUseCase from './application/AnalysisUseCase';
import AnalysisRepository from './infrastructure/AnalysisRepository';
import AnalysisService from './infrastructure/AnalysisService';
import { useAnalysisMetaStore } from './store/analysisMetaStore';

import type { HttpClient } from '../../app/infrastructure/http/httpClient';
import type { App } from 'vue';

export function registerAnalysisDependencies(app: App, httpClient: HttpClient, analysisMetaStore: ReturnType<typeof useAnalysisMetaStore>) {
    const analysisService = new AnalysisService(httpClient)
    const analysisRepository = new AnalysisRepository(analysisService)
    const analysisUseCase = new AnalysisUseCase(analysisMetaStore, analysisRepository)

    app.provide(DIKeys.AnalysisUseCase, analysisUseCase);
}
