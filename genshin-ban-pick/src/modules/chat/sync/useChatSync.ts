// src/modules/chat/sync/useChatSync.ts

import { useSocketStore } from '@/app/stores/socketStore';
import { useAuthStore } from '@/modules/auth';
import { createLogger } from '@/app/utils/logger';
import { ChatEvent } from '@shared/contracts/chat/value-types';
import { useChatUseCase } from '../ui/composables/useChatUseCase';

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

const logger = createLogger('chat.sync');

export function useChatSync() {
    const socket = useSocketStore().getSocket();
    const chatUseCase = useChatUseCase();
    const authStore = useAuthStore();

    function registerChatSync() {
        socket.on(`${ChatEvent.MessagesStateSyncSelf}`, handleChatMessagesStateSync);
        socket.on(`${ChatEvent.MessageSendBroadcast}`, handleChatMessageSendBroadcast);
    }

    function fetchChatState() {
        logger.debug('sent chat state request');
        socket.emit(`${ChatEvent.MessagesStateRequest}`);
    }

    function sendMessage(messageText: string) {
        logger.debug('sent message request', messageText);
        if (!authStore.identityKey || !authStore.nickname) return;
        const message = chatUseCase.handleSendMessage(authStore.identityKey, authStore.nickname, messageText);
        socket.emit(`${ChatEvent.MessageSendRequest}`, { message });
    }

    function handleChatMessagesStateSync(newMessages: IChatMessage[]) {
        logger.debug('messages state sync', newMessages);
        chatUseCase.setMessages(newMessages);
    }

    function handleChatMessageSendBroadcast(message: IChatMessage) {
        logger.debug('message send broadcast', message);
        chatUseCase.addMessage(message);
    }

    return {
        registerChatSync,
        fetchChatState,
        sendMessage,
    };
}
