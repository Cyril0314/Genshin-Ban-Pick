import type { Identity } from '../identity/Identity';

export interface IRoomUser {
    socketId: string;
    identity: Identity;
    nickname: string;
    timestamp: number;
}
