// src/modules/chat/applicaiton/chatUseCase.ts

import { addMessageDomain } from "../domain/addMessageDomain";
import { sendMessageDomain } from "../domain/sendMessageDomain";
import { useChatStore } from "../store/chatStore";

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

export function chatUseCase() {

    const chatStore = useChatStore()

    function handleSendMessage(identityKey: string, nickname: string, message: string) {
        const prevMessages = chatStore.messages
        const { messages, newMessage } = sendMessageDomain(prevMessages, identityKey, nickname, message)
        chatStore.setMessages(messages)
        return newMessage
    }

    function addMessage(message: IChatMessage) {
        const prevMessages = chatStore.messages
        const nextMessages = addMessageDomain(prevMessages, message)
        chatStore.setMessages(nextMessages)
    }

    function setMessages(messages: IChatMessage[], identityKey?: string) {
        chatStore.setMessages(messages)
    }
    
    return {
        handleSendMessage,
        addMessage,
        setMessages,
    }
}