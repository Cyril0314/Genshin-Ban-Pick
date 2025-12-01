// src/modules/chat/domain/addMessageDomain.ts

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

export function addMessageDomain(messages: IChatMessage[], message: IChatMessage) {
    const newMessages = [...messages]
    newMessages.push(message)
    return newMessages
}