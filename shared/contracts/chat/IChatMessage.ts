
import type { Identity } from '../auth/Identity';

export interface IChatMessage {
    identity: Identity;
    nickname: string;
    message: string;
    timestamp?: number;
}
