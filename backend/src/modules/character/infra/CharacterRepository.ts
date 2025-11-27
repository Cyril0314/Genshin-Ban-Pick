// src/modules/character/infra/CharacterRepository.ts

import { Character, PrismaClient } from '@prisma/client';

import ICharacterRepository from '../domain/ICharacterRepository';
import { ICharacter } from '@shared/contracts/character/ICharacter';
import { Rarity, Element, Weapon, ModelType, CharacterRole, Region, Wish  } from '@shared/contracts/character/value-types';

export default class CharacterRepository implements ICharacterRepository {
    constructor(private prisma: PrismaClient) {}

    async findAll() {
        const characters = await this.prisma.character.findMany({
            orderBy: { id: 'asc' },
        });
        return characters.map(this.mapData);
    }

    private mapData(character: Character): ICharacter {
        return {
            id: character.id,
            key: character.key,
            name: character.name,
            rarity: character.rarity as Rarity,
            element: character.element as Element,
            weapon: character.weapon as Weapon,
            region: character.region as Region,
            modelType: character.modelType as ModelType,
            releaseDate: character.releaseDate,
            version: character.version,
            role: character.role as CharacterRole,
            wish: character.wish as Wish,
        };
    }
}
