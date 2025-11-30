
import CharacterUseCase from './application/CharacterUseCase';
import CharacterRepository from './infrastructure/CharacterRepository';
import CharacterService from './infrastructure/CharacterService';
import { useCharacterStore } from './store/characterStore';

import type { HttpClient } from '../../app/infrastructure/http/httpClient';
import type { App } from 'vue';

export function registerCharacterDependencies(app: App, httpClient: HttpClient, characterStore: ReturnType<typeof useCharacterStore>,) {
    // 將 httpClient 注入到 BoardImageStateManager

    const characterService = new CharacterService(httpClient)
    const characterRepository = new CharacterRepository(characterService)
    const characterUseCase = new CharacterUseCase(characterStore, characterRepository)

    app.provide('character-use-case', characterUseCase);
}
