// src/modules/room/domain/IRoomStateRepository.ts

import { IRoomUser } from '@shared/contracts/room/IRoomUser';
import { IRoomState } from '@shared/contracts/room/IRoomState';

export default interface IRoomStateRepository {
    findAll(): Record<string, IRoomState>;
    findById(roomId: string): IRoomState | null;
    create(roomId: string, state: IRoomState): IRoomState;
    upsert(roomId: string, state: IRoomState): IRoomState;
    updateRoomUsersById(roomId: string, users: IRoomUser[]): number;
}
