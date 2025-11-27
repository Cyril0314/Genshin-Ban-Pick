// src/modules/chat/domain/transformChatMessageDomain.ts

import type { IChatMessage } from '../types/IChatMessage';
import type { IChatMessageDTO } from '@shared/contracts/chat/IChatMessageDTO';

export function transformChatMessageDomain(newMessageDTO: IChatMessageDTO, identityKey?: string): IChatMessage {
    const isSelf = newMessageDTO.identityKey === identityKey;
    return {
        nickname: newMessageDTO.nickname,
        message: newMessageDTO.message,
        timestamp: newMessageDTO.timestamp,
        isSelf: isSelf,
    };
}
