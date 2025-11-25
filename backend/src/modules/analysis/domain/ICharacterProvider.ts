// backend/src/modules/analysis/domain/ICharacterProvider.ts

import { Character } from '@prisma/client';

export interface ICharacterProvider {
    fetchCharacters(): Promise<Character[]>;
}