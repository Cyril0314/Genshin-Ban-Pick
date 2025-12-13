// backend/src/modules/match/application/match.service.ts

import { DataNotFoundError } from '../../../errors/AppError';
import { createLogger } from '../../../utils/logger';
import { validateSnapshot } from '../domain/validateSnapshot';

import type { IMatchSnapshotRepository } from '../domain/IMatchSnapshotRepository';
import type { IMatchRepository } from '../domain/IMatchRepository';

const logger = createLogger('MATCH');

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
        return this.matchRepository.create(snapshot, false);
    }

    async fetchMatchTeamMembers() {
        return this.matchRepository.findAllMatchTeamMemberUniqueIdentities()
    }
}
