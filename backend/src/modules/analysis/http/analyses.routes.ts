// backend/src/modules/analysis/http/analyses.routes.ts

import express from 'express';

import { createLogger } from '../../../utils/logger';
import { asyncHandler } from '../../../utils/asyncHandler';
import AnalysisController from '../controller/analysis.controller';

const logger = createLogger('ANALYSIS');

// /{domain}/{capability}/{scope-or-subject}/{representation}
// domain: analyses
// capability: player-style/character-usage/character-synergy/character-cluster/match-summary
// scope: player/global/character/team/match
// representation: summary/profile/distribution/matrix/graph/radar

export default function createAnalysesRouter(analysisController: AnalysisController) {
    const router = express.Router();
    router.get('/overview',  asyncHandler(analysisController.fetchOverview))
    
    router.get('/character-usages/summary', asyncHandler(analysisController.fetchCharacterUsageSummary));
    router.get('/character-usages/pick-priority', asyncHandler(analysisController.fetchCharacterUsagePickPriority));

    router.get('/character-synergy/matrix', asyncHandler(analysisController.fetchCharacterSynergyMatrix));
    router.get('/character-synergy/graph', asyncHandler(analysisController.fetchCharacterSynergyGraph));
    router.get('/character-cluster', asyncHandler(analysisController.fetchCharacterCluster));

    router.get('/player-character-usages', asyncHandler(analysisController.fetchPlayerCharacterUsage));
    router.get('/player-style/profile', asyncHandler(analysisController.fetchPlayerStyleProfile));

    router.get('/character-attribute/distributions', asyncHandler(analysisController.fetchCharacterAttributeDistributions))

    return router;
}
