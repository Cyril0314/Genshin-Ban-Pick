// backend/src/modules/match/http/matches.routes.ts

import express from 'express';

import { asyncHandler } from '../../../utils/asyncHandler';
import MatchController from '../controller/match.controller';

export default function createMatchesRouter(matchController: MatchController) {
    const router = express.Router();
    router.post('/', asyncHandler(matchController.saveMatch))
    router.delete('/:matchId', asyncHandler(matchController.deleteMatch))
    router.get('/team-members', asyncHandler(matchController.fetchMatchTeamMembers))
    return router;
}
