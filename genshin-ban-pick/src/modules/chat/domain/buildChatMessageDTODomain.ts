// src/modules/chat/domain/buildChatMessageDTODomain.ts

import type { IChatMessageDTO } from '@shared/contracts/chat/IChatMessageDTO';

export function buildChatMessageDTODomain(identityKey: string, nickname: string, message: string, date = Date.now()) {
    const messageDTO: IChatMessageDTO = {
        identityKey: identityKey,
        nickname: nickname,
        message: message,
        timestamp: date,
    };
    return messageDTO
}
