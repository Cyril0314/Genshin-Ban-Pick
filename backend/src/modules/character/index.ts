// src/modules/character/index.ts

import { PrismaClient } from '@prisma/client/extension';

import CharacterController from './controller/character.controller.ts';
import CharacterService from './application/character.service.ts';
import { createCharactersRouter } from './http/characters.routes.ts';

export function createCharacterModule(prisma: PrismaClient) {

    const service = new CharacterService(prisma);
    const controller = new CharacterController(service);
    const router = createCharactersRouter(controller);
    return { router, controller, service };
}
