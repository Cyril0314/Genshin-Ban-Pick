import IRoomStateManager from '../../socket/domain/IRoomStateManager';
import IRoomStateRepository from '../domain/IRoomStateRepository';
import { IRoomState } from '@shared/contracts/room/IRoomState';
import { IRoomUser } from '@shared/contracts/room/IRoomUser';

export default class RoomStateRepository implements IRoomStateRepository {
    constructor(private roomStateManager: IRoomStateManager) {}

    findAll() {
        return this.roomStateManager.getRoomStates();
    }

    findById(roomId: string) {
        return this.roomStateManager.get(roomId);
    }

    create(roomId: string, state: IRoomState) {
        this.roomStateManager.setRoomState(roomId, state);
        return state
    }

    upsert(roomId: string, state: IRoomState) {
        this.roomStateManager.setRoomState(roomId, state);
        return state
    }

    updateRoomUsersById(roomId: string, users: IRoomUser[]) {
        this.roomStateManager.setUsers(roomId, users);
        return users.length
    }
}
