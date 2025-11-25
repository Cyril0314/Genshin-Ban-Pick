// backend/src/modules/character/application/character.service.ts

import { PrismaClient } from '@prisma/client';

import { DataNotFoundError } from '../../../errors/AppError.ts';
import { ICharacterProvider } from '../../analysis/domain/ICharacterProvider.ts';

export default class CharacterService implements ICharacterProvider {
    constructor(private prisma: PrismaClient) {}

    async fetchCharacters() {
        try {
            const characters = await this.prisma.character.findMany({
                orderBy: { id: 'asc' },
            });

            if (!characters || characters.length === 0) {
                throw new DataNotFoundError();
            }
            return characters;
        } catch (error) {
            console.error('[CharacterService] Failed to fetch characters:', error);
            throw new DataNotFoundError();
        }
    }
}
