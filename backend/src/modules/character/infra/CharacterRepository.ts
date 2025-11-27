// src/modules/character/infra/CharacterRepository.ts

import { PrismaClient } from '@prisma/client';

import ICharacterRepository from '../domain/ICharacterRepository';
import { mapCharacterFromPrisma } from '../domain/mapCharacterFromPrisma';

export default class CharacterRepository implements ICharacterRepository {
    constructor(private prisma: PrismaClient) {}

    async findAll() {
        const characters = await this.prisma.character.findMany({
            orderBy: { id: 'asc' },
        });
        return characters.map(mapCharacterFromPrisma);
    }
}
