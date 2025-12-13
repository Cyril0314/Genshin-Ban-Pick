// backend/src/modules/match/http/matches.routes.ts

import express from 'express';

import { createLogger } from '../../../utils/logger';
import { asyncHandler } from '../../../utils/asyncHandler';
import MatchController from '../controller/match.controller';

const logger = createLogger('MATCH');

export default function createMatchesRouter(matchController: MatchController) {
    const router = express.Router();
    router.post('/', asyncHandler(matchController.saveMatch))
    router.get('/team-members', asyncHandler(matchController.fetchMatchTeamMembers))
    return router;
}
