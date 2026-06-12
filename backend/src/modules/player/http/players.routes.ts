// src/modules/player/http/players.routes.ts

import express from 'express';

import { asyncHandler } from '../../../utils/asyncHandler';
import PlayerController from '../controller/player.controller';

export default function createPlayersRouter(playerController: PlayerController) {
    const router = express.Router();

    router.get('/', asyncHandler(playerController.fetchPlayers));
    router.get('/records', asyncHandler(playerController.fetchPlayerRecord));
    router.get('/matches', asyncHandler(playerController.fetchPlayerMatches));
    router.get('/teammates', asyncHandler(playerController.fetchPlayerTeammates));

    return router;
}
