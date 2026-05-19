import type { Identity } from '../auth/Identity';

export interface IRoomUser {
    socketId: string;
    identity: Identity;
    nickname: string;
    timestamp: number;
}
