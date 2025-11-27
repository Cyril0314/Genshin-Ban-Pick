// src/modules/chat/domain/addMessageDomain.ts

import { transformChatMessageDomain } from "./transformChatMessageDomain";

import type { IChatMessage } from "../types/IChatMessage";
import type { IChatMessageDTO } from '@shared/contracts/chat/IChatMessageDTO';

export function addMessageDomain(messages: IChatMessage[], messageDTO: IChatMessageDTO, identityKey?: string) {
    const newMessages = messages
    const chatMessage = transformChatMessageDomain(messageDTO, identityKey);
    newMessages.push(chatMessage)
    return newMessages
}