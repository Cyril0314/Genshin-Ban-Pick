// src/modules/match/infrastructure/MatchRepository.ts

import { toTimeWindowQuery } from '@shared/contracts/common/dto/ITimeWindowQuery';

import type MatchService from './MatchService';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';
import type { IMatch } from '@shared/contracts/match/IMatch';
import type { IMatchTimestamp } from '@shared/contracts/match/IMatchTimestamp';
import type { TeamMember } from '@shared/contracts/team/TeamMember';

export default class MatchRepository {
    constructor(private matchService: MatchService) {}

    async saveMatch(roomId: string) {
        const response = await this.matchService.post({ roomId });
        return response.data as IMatch;
    }

    async fetchMatch(matchId: number) {
        const response = await this.matchService.get({ matchId });
        return response.data as IMatch;
    }

    async deleteMatch(matchId: number) {
        const response = await this.matchService.delete({ matchId });
    }

    async fetchMatchTeamMembers() {
        const response = await this.matchService.getMatchTeamMembers();
        const matchTeamMembers = response.data;
        return matchTeamMembers as TeamMember[];
    }

    async fetchMatchTimestamps(timeWindow?: ITimeWindow): Promise<IMatchTimestamp[]> {
        const query = timeWindow ? toTimeWindowQuery(timeWindow) : undefined;
        const response = await this.matchService.getMatchTimestamps(query);
        return response.data.map((m: any) => ({
            id: m.id,
            createdAt: new Date(m.createdAt),
        }));
    }
}
