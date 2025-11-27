// backend/src/modules/character/http/characters.routes.ts

import express from 'express';

import { createLogger } from '../../../utils/logger';
import { asyncHandler } from '../../../utils/asyncHandler';
import CharacterController from '../controller/character.controller';

const logger = createLogger('CHARACTER');

export function createCharactersRouter(characterController: CharacterController) {
    const router = express.Router();
    router.get('/', asyncHandler(characterController.fetchCharacters))

    return router;
}
