// backend/src/services/CharacterSevice.ts

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { PrismaClient } from '@prisma/client';

import { DataNotFoundError } from '../errors/AppError.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class CharacterService {
    constructor(private prisma: PrismaClient) {}

    async getCharacters() {
        try {
            const characters = await this.prisma.character.findMany({
                orderBy: { id: 'asc' }, // 可按需求排序
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
