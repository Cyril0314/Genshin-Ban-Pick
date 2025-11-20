// src/features/ChatRoom/composables/useChatSync.ts
import { storeToRefs } from 'pinia';

import type { IChatMessage } from '@/features/ChatRoom/types/IChatMessage';
import type { IChatMessageDTO } from '@/features/ChatRoom/types/IChatMessageDTO';

import { useSocketStore } from '@/stores/socketStore';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { useChatStore } from '@/stores/chatStore';

enum ChatEvent {
    MessageSendRequest = 'chat.message.send.request',
    MessageSendBroadcast = 'chat.message.send.broadcast',

    MessagesStateRequest = 'chat.messages.state.request',
    MessagesStateSyncSelf = 'chat.messages.state.sync.self',
}

export function useChatSync() {
    const socket = useSocketStore().getSocket();
    const authStore = useAuthStore();
    const { identityKey, nickname } = storeToRefs(authStore);
    const chatStore = useChatStore();
    const { messages } = storeToRefs(chatStore);
    const { addMessage, setMessages } = chatStore;

    function registerChatSync() {
        socket.on(`${ChatEvent.MessagesStateSyncSelf}`, handleChatMessagesStateSync);
        socket.on(`${ChatEvent.MessageSendBroadcast}`, handleChatMessageSendBroadcast);
    }

    function sendMessage(message: string) {
        console.debug('[CHAT] Sent chat message send request', message);

        if (!identityKey.value || !nickname.value) return;

        const messageDTO: IChatMessageDTO = {
            identityKey: identityKey.value,
            nickname: nickname.value,
            message: message,
            timestamp: Date.now(),
        };
        const chatMessage = transformChatMessage(messageDTO);
        addMessage(chatMessage);

        socket.emit(`${ChatEvent.MessageSendRequest}`, messageDTO);
    }

    function handleChatMessagesStateSync(newMessageDTOs: IChatMessageDTO[]) {
        console.debug(`[CHAT] Handle chat messages state sync`, newMessageDTOs);
        const chatMessages = newMessageDTOs.map(transformChatMessage);
        setMessages(chatMessages);
    }

    function handleChatMessageSendBroadcast(messageDTO: IChatMessageDTO) {
        console.debug(`[CHAT] Handle chat message send broadcast`, messageDTO);
        const chatMessage = transformChatMessage(messageDTO);
        addMessage(chatMessage);
    }

    function transformChatMessage(newMessageDTO: IChatMessageDTO): IChatMessage {
        const isSelf = newMessageDTO.identityKey === identityKey.value;
        return {
            nickname: newMessageDTO.nickname,
            message: newMessageDTO.message,
            timestamp: newMessageDTO.timestamp,
            isSelf: isSelf,
        };
    }

    return {
        messages,
        registerChatSync,
        sendMessage,
        // changeNickname
    };
}
