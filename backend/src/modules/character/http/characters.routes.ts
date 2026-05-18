// backend/src/modules/character/http/characters.routes.ts

import express from 'express';

import { asyncHandler } from '../../../utils/asyncHandler';
import CharacterController from '../controller/character.controller';

export default function createCharactersRouter(characterController: CharacterController) {
    const router = express.Router();
    router.get('/', asyncHandler(characterController.fetchCharacters))

    return router;
}
