// src/modules/chat/domain/setMessagesDomain.ts

import { transformChatMessageDomain } from "./transformChatMessageDomain";

import type { IChatMessage } from "../types/IChatMessage";
import type { IChatMessageDTO } from "../types/IChatMessageDTO";

export function setMessagesDomain(messages: IChatMessage[], messageDTOs: IChatMessageDTO[], identityKey?: string) {
    let newMessages = messages
    const chatMessages = messageDTOs.map((messageDTO) => {
        return transformChatMessageDomain(messageDTO, identityKey)
    });
    newMessages = chatMessages
    return newMessages
}