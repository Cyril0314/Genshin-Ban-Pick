// src/modules/character/index.ts

import { PrismaClient } from '@prisma/client';

import CharacterController from './controller/character.controller';
import CharacterService from './application/character.service';
import createCharactersRouter from './http/characters.routes';
import CharacterRepository from './infra/CharacterRepository';

export function createCharacterModule(prisma: PrismaClient) {
    const repository = new CharacterRepository(prisma)
    const service = new CharacterService(repository);
    const controller = new CharacterController(service);
    const router = createCharactersRouter(controller);
    return { router, controller, service, repository };
}
