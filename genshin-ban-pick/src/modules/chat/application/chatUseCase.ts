// src/modules/chat/applicaiton/chatUseCase.ts

import { addMessageDomain } from "../domain/addMessageDomain";
import { sendMessageDomain } from "../domain/sendMessageDomain";
import { setMessagesDomain } from "../domain/setMessagesDomain";
import { useChatStore } from "../store/chatStore";

import type { IChatMessageDTO } from '@shared/contracts/chat/IChatMessageDTO';

export function chatUseCase() {

    const chatStore = useChatStore()

    function handleSendMessage(identityKey: string, nickname: string, message: string) {
        const prevMessages = chatStore.messages
        const { messages, messageDTO } = sendMessageDomain(prevMessages, identityKey, nickname, message)
        chatStore.setMessages(messages)
        return messageDTO
    }

    function addMessage(messageDTO: IChatMessageDTO) {
        const prevMessages = chatStore.messages
        const nextMessages = addMessageDomain(prevMessages, messageDTO)
        chatStore.setMessages(nextMessages)
    }

    function setMessages(messageDTOs: IChatMessageDTO[], identityKey?: string) {
        const prevMessages = chatStore.messages
        const nextMessages = setMessagesDomain(prevMessages, messageDTOs, identityKey)
        chatStore.setMessages(nextMessages)
    }
    
    return {
        handleSendMessage,
        addMessage,
        setMessages,
    }
}