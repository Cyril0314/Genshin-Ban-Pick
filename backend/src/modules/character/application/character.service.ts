// backend/src/modules/character/application/character.service.ts

import { DataNotFoundError } from '../../../errors/AppError';

import type { ICharacterRepository } from '../domain/ICharacterRepository';

export default class CharacterService {
    constructor(private characterRepository: ICharacterRepository) {}

    async fetchCharacters() {
        const characters = await this.characterRepository.findAll();
        if (!characters || characters.length === 0) {
            throw new DataNotFoundError();
        }
        return characters;
    }
}
