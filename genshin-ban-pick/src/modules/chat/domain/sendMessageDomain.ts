// src/modules/chat/domain/sendMessageDomain.ts

import { buildChatMessageDTODomain } from "./buildChatMessageDTODomain";
import { transformChatMessageDomain } from "./transformChatMessageDomain";

import type { IChatMessage } from "../types/IChatMessage";
import { addMessageDomain } from "./addMessageDomain";

export function sendMessageDomain(messages: IChatMessage[], identityKey: string, nickname: string, message: string, date = Date.now()) {
    const messageDTO = buildChatMessageDTODomain(identityKey, nickname, message, date)
    const newMessages = addMessageDomain(messages, messageDTO, identityKey)
    return { messages: newMessages, messageDTO}
}