import type { Identity } from '../identity/Identity';

export interface IChatMessage {
    identity: Identity;
    nickname: string;
    message: string;
    timestamp?: number;
}
