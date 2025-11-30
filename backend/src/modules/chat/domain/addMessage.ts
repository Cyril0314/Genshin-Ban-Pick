// backend/src/modules/chat/domain/addMessage.ts

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

export function addMessage(messages: IChatMessage[], message: IChatMessage) {
    const newMessages = [...messages]
    newMessages.push(message)
    return newMessages
}