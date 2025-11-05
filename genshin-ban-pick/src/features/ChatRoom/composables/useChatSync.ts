// src/features/ChatRoom/composables/useChatSync.ts
import { storeToRefs } from 'pinia';

import type { IChatMessage } from '@/types/IChatMessage';
import type { IChatMessageDTO } from '@/types/IChatMessageDTO';

import { useSocketStore } from '@/stores/socketStore';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';

enum SocketEvent {
    CHAT_MESSAGE_SEND_REQUEST = 'chat.message.send.request',
    CHAT_MESSAGE_SEND_BROADCAST = 'chat.message.send.broadcast',

    CHAT_MESSAGES_STATE_REQUEST = 'chat.messages.state.request',
    CHAT_MESSAGES_STATE_SYNC_SELF = 'chat.messages.state.sync.self',
}

export function useChatSync() {
    const socket = useSocketStore().getSocket();
    const authStore = useAuthStore();
    const { identityKey, nickname } = storeToRefs(authStore);
    const chatStore = useChatStore();
    const { messages } = storeToRefs(chatStore);
    const { addMessage, setMessages } = chatStore;

    function registerChatSync() {
        socket.on(`${SocketEvent.CHAT_MESSAGES_STATE_SYNC_SELF}`, handleChatMessagesStateSync);
        socket.on(`${SocketEvent.CHAT_MESSAGE_SEND_BROADCAST}`, handleChatMessageSendBroadcast);
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

        socket.emit(`${SocketEvent.CHAT_MESSAGE_SEND_REQUEST}`, messageDTO);
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
