import { IRoomState } from '../domain/IRoomState.ts';
import { IRoomStateManager } from '../../socket/managers/IRoomStateManager.ts';
import { IRoomStateRepository } from '../domain/IRoomStateRepository.ts';
import { IRoomUser } from '../types/IRoomUser.ts';

export default class RoomStateRepository implements IRoomStateRepository {
    constructor(private roomStateManager: IRoomStateManager) {}

    getAll() {
        return this.roomStateManager.getRoomStates();
    }

    get(roomId: string) {
        return this.roomStateManager.get(roomId);
    }

    set(roomId: string, state: IRoomState) {
        this.roomStateManager.setRoomState(roomId, state);
    }

    setRoomUsers(roomId: string, users: IRoomUser[]) {
        this.roomStateManager.setUsers(roomId, users);
    }
}
