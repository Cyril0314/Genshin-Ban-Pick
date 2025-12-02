// src/modules/match/application/matchUseCase.ts

import type MatchRepository from "../infrastructure/MatchRepository";

export default class MatchUseCase {
    constructor(private matchRepository: MatchRepository) {}

    async saveMatch(roomId: string) {
        const matchResult = await this.matchRepository.saveMatch(roomId);
        return matchResult;
    }
}
