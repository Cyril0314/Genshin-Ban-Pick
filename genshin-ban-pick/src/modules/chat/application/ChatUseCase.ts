// src/modules/chat/applicaiton/ChatUseCase.ts

import { addMessageDomain } from "../domain/addMessageDomain";
import { sendMessageDomain } from "../domain/sendMessageDomain";
import { useChatStore } from "../store/chatStore";

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

export default class ChatUseCase {
    constructor(private chatStore: ReturnType<typeof useChatStore>) {}

    handleSendMessage(identityKey: string, nickname: string, message: string) {
        const prevMessages = this.chatStore.messages
        const { messages, newMessage } = sendMessageDomain(prevMessages, identityKey, nickname, message)
        this.chatStore.setMessages(messages)
        return newMessage
    }

    addMessage(message: IChatMessage) {
        const prevMessages = this.chatStore.messages
        const nextMessages = addMessageDomain(prevMessages, message)
        this.chatStore.setMessages(nextMessages)
    }

    setMessages(messages: IChatMessage[], identityKey?: string) {
        this.chatStore.setMessages(messages)
    }

    setHasUnreadMessage(hasUnreadMessage: boolean) {
        this.chatStore.setHasUnreadMessage(hasUnreadMessage)
    }
}