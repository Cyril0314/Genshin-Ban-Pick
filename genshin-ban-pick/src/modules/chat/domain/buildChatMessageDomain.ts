// src/modules/chat/domain/buildChatMessageDomain.ts

import type { Identity } from '@shared/contracts/auth/Identity';
import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

export function buildChatMessageDomain(identity: Identity, nickname: string, messageText: string, date = Date.now()) {
    const message: IChatMessage = {
        identity,
        nickname,
        message: messageText,
        timestamp: date,
    };
    return message;
}
