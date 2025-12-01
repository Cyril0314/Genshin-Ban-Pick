// src/modules/chat/domain/sendMessageDomain.ts

import { addMessageDomain } from "./addMessageDomain";
import { buildChatMessageDomain } from "./buildChatMessageDomain";

import type { IChatMessage } from "@shared/contracts/chat/IChatMessage";

export function sendMessageDomain(messages: IChatMessage[], identityKey: string, nickname: string, message: string, date = Date.now()) {
    const newMessage = buildChatMessageDomain(identityKey, nickname, message, date)
    const newMessages = addMessageDomain(messages, newMessage)
    return { messages: newMessages, newMessage}
}