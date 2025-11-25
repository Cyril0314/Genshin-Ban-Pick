// backend/src/modules/character/http/characters.router.ts

import express from 'express';

import { createLogger } from '../../../utils/logger.ts';
import { asyncHandler } from '../../../utils/asyncHandler.ts';
import CharacterController from '../controller/character.controller.ts';

const logger = createLogger('CHARACTER');

export function createCharactersRouter(characterController: CharacterController) {
    const router = express.Router();
    router.get('/', asyncHandler(characterController.fetchCharacters))

    return router;
}
