// src/modules/match/application/matchUseCase.ts

import type MatchRepository from '../infrastructure/MatchRepository';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';

export default class MatchUseCase {
    constructor(private matchRepository: MatchRepository) {}

    async saveMatch(roomId: string) {
        const matchResult = await this.matchRepository.saveMatch(roomId);
        return matchResult;
    }

    async fetchMatch(matchId: number) {
        return await this.matchRepository.fetchMatch(matchId);
    }

    async deleteMatch(matchId: number) {
        await this.matchRepository.deleteMatch(matchId);
    }

    async fetchMatchTeamMembers() {
        const matchTeamMembers = await this.matchRepository.fetchMatchTeamMembers();
        return matchTeamMembers;
    }

    async fetchMatchTimestamps(timeWindow?: ITimeWindow) {
        return await this.matchRepository.fetchMatchTimestamps(timeWindow);
    }
}
