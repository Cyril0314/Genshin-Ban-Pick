// src/modules/chat/sync/useChatSync.ts
import { useSocketStore } from '@/app/stores/socketStore';
import { useAuthStore } from '@/modules/auth';
import { chatUseCase } from '../application/chatUseCase';

import type { IChatMessage } from '@shared/contracts/chat/IChatMessage';

enum ChatEvent {
    MessageSendRequest = 'chat.message.send.request',
    MessageSendBroadcast = 'chat.message.send.broadcast',

    MessagesStateRequest = 'chat.messages.state.request',
    MessagesStateSyncSelf = 'chat.messages.state.sync.self',
}

export function useChatSync() {
    const socket = useSocketStore().getSocket();
    const { handleSendMessage, addMessage, setMessages } = chatUseCase();
    const authStore = useAuthStore();

    function registerChatSync() {
        socket.on(`${ChatEvent.MessagesStateSyncSelf}`, handleChatMessagesStateSync);
        socket.on(`${ChatEvent.MessageSendBroadcast}`, handleChatMessageSendBroadcast);
    }

    function sendMessage(messageText: string) {
        console.debug('[CHAT] Sent chat message send request', messageText);
        if (!authStore.identityKey || !authStore.nickname) return;
        const message = handleSendMessage(authStore.identityKey, authStore.nickname, messageText);
        socket.emit(`${ChatEvent.MessageSendRequest}`, { message });
    }

    function handleChatMessagesStateSync(newMessages: IChatMessage[]) {
        console.debug(`[CHAT] Handle chat messages state sync`, newMessages);
        setMessages(newMessages, authStore.identityKey ?? undefined);
    }

    function handleChatMessageSendBroadcast(message: IChatMessage) {
        console.debug(`[CHAT] Handle chat message send broadcast`, message);
        addMessage(message);
    }

    return {
        registerChatSync,
        sendMessage,
    };
}
