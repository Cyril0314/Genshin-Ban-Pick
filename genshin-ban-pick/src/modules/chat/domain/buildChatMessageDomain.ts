// src/modules/chat/domain/buildChatMessageDomain.ts

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

export function buildChatMessageDomain(identityKey: string, nickname: string, messageText: string, date = Date.now()) {
    const message: IChatMessage = {
        identityKey: identityKey,
        nickname: nickname,
        message: messageText,
        timestamp: date,
    };
    return message
}
