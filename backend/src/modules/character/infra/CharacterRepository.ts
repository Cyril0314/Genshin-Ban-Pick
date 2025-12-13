// src/modules/character/infra/CharacterRepository.ts

import { PrismaClient } from '@prisma/client';
import { mapCharacter } from '../domain/mapCharacter';

import type { ICharacterRepository } from '../domain/ICharacterRepository';

export default class CharacterRepository implements ICharacterRepository {
    constructor(private prisma: PrismaClient) {}

    async findAll() {
        const characters = await this.prisma.character.findMany({
            orderBy: { id: 'asc' },
        });
        return characters.map(mapCharacter);
    }
}
