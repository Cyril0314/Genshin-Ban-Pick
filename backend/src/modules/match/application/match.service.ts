// backend/src/modules/match/application/match.service.ts

import { DataNotFoundError } from '../../../errors/AppError';
import { createLogger } from '../../../utils/logger';
import { dedupTeamMembers } from '../domain/dedupTeamMembers';
import { validateSnapshot } from '../domain/validateSnapshot';

import type { IMatchRepository } from '../domain/IMatchRepository';
import type { IMatchSnapshotRepository } from '../domain/IMatchSnapshotRepository';
import type { ITimeWindow } from '@shared/contracts/common/ITimeWindow';

const logger = createLogger('match.service');

export default class MatchService {
    constructor(
        private matchRepository: IMatchRepository,
        private matchSnapshotRepository: IMatchSnapshotRepository,
    ) {}

    async saveMatch(roomId: string) {
        const snapshot = this.matchSnapshotRepository.findById(roomId);
        if (!snapshot) {
            logger.error('Room state not found');
            throw new DataNotFoundError();
        }
        validateSnapshot(snapshot);
        return this.matchRepository.create(snapshot);
    }

    async fetchMatch(matchId: number) {
        const match = await this.matchRepository.findById(matchId);
        if (!match) {
            logger.error('Match not found', { matchId });
            throw new DataNotFoundError();
        }
        return match;
    }

    async deleteMatch(matchId: number) {
        await this.matchRepository.delete(matchId)
    }

    async fetchMatchTeamMembers() {
        const rows = await this.matchRepository.findMatchTeamMembers();
        return dedupTeamMembers(rows);
    }

    async fetchMatchTimestamps(timeWindow?: ITimeWindow) {
        return this.matchRepository.findMatchTimestamps(timeWindow);
    }
}
