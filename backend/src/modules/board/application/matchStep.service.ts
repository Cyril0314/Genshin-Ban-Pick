// backend/src/modules/board/application/matchStep.service.ts

import type { IRoomStateRepository } from '../../room';

export default class MatchStepService {
    constructor(private roomStateRepository: IRoomStateRepository) {}

    advance(roomId: string) {
        const prevStepIndex = this.roomStateRepository.findStepIndexById(roomId);
        const nextStepIndex = prevStepIndex + 1;
        this.roomStateRepository.updateStepIndexById(roomId, nextStepIndex);
    }

    rollback(roomId: string) {
        const prevStepIndex = this.roomStateRepository.findStepIndexById(roomId);
        const nextStepIndex = prevStepIndex - 1;
        this.roomStateRepository.updateStepIndexById(roomId, nextStepIndex);
    }

    reset(roomId: string) {
        const nextStepIndex = 0;
        this.roomStateRepository.updateStepIndexById(roomId, nextStepIndex);
    }

    getStepIndex(roomId: string) {
        return this.roomStateRepository.findStepIndexById(roomId);
    }
}
