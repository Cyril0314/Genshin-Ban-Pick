// src/modules/chat/sync/useChatSync.ts
import { useSocketStore } from '@/app/stores/socketStore';
import { useAuthStore } from '@/modules/auth';
import { chatUseCase } from '../application/chatUseCase';

import type { IChatMessageDTO } from '@shared/contracts/chat/IChatMessageDTO';

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

    function sendMessage(message: string) {
        console.debug('[CHAT] Sent chat message send request', message);
        if (!authStore.identityKey || !authStore.nickname) return;
        const messageDTO = handleSendMessage(authStore.identityKey, authStore.nickname, message);
        socket.emit(`${ChatEvent.MessageSendRequest}`, messageDTO);
    }

    function handleChatMessagesStateSync(newMessageDTOs: IChatMessageDTO[]) {
        console.debug(`[CHAT] Handle chat messages state sync`, newMessageDTOs);
        setMessages(newMessageDTOs, authStore.identityKey ?? undefined);
    }

    function handleChatMessageSendBroadcast(messageDTO: IChatMessageDTO) {
        console.debug(`[CHAT] Handle chat message send broadcast`, messageDTO);
        addMessage(messageDTO);
    }

    return {
        registerChatSync,
        sendMessage,
    };
}
