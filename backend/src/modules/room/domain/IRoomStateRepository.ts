import { IRoomUser } from '../types/IRoomUser.ts';
import { IRoomState } from './IRoomState.ts';

export interface IRoomStateRepository {
    getAll(): Record<string, IRoomState>;
    get(roomId: string): IRoomState | undefined;
    set(roomId: string, state: IRoomState): void;

    setRoomUsers(roomId: string, users: IRoomUser[]): void;
}
