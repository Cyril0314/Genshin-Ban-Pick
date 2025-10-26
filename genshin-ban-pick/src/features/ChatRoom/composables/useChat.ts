// src/features/ChatRoom/composables/useChat.ts
import { ref, onMounted, onUnmounted } from 'vue';

import type { IChatMessage } from '@/types/IChatMessage';

import { useSocketStore } from '@/stores/socketStore';

enum SocketEvent {
    CHAT_MESSAGE_SEND_REQUEST = 'chat.message.send.request',
    CHAT_MESSAGE_SEND_BROADCAST = 'chat.message.send.broadcast',

    CHAT_MESSAGES_STATE_SYNC_SELF = 'chat.messages.state.sync.self',
}

export function useChat() {
    const socket = useSocketStore().getSocket();
    const messages = ref<IChatMessage[]>([]);

    function sendMessage(message: string) {
        console.debug('[CHAT] Sent chat message send request', message);
        socket.emit(`${SocketEvent.CHAT_MESSAGE_SEND_REQUEST}`, {
            message,
        });

        messages.value.push({
            senderName: `我`,
            message,
        });
    }

    function handleChatMessagesStateSync(newMessages: IChatMessage[]) {
        console.debug(`[CHAT] Handle chat messages state sync`, newMessages);
        messages.value = newMessages;
    }

    function handleChatMessageSendBroadcast(message: IChatMessage) {
        console.debug(`[CHAT] Handle chat message send broadcast`, message);
        messages.value.push(message);
    }

    // function changeNickname() {
    //     const newName = prompt('輸入暱稱:', nickname.value)
    //     if (newName && newName !== nickname.value) {
    //         nickname.value = newName
    //         localStorage.setItem('nickname', newName)
    //     }
    // }

    onMounted(() => {
        console.debug('[CHAT] On mounted');
        socket.on(`${SocketEvent.CHAT_MESSAGES_STATE_SYNC_SELF}`, handleChatMessagesStateSync);
        socket.on(`${SocketEvent.CHAT_MESSAGE_SEND_BROADCAST}`, handleChatMessageSendBroadcast);
    });

    onUnmounted(() => {
        console.debug('[CHAT] On unmounted');
        socket.off(`${SocketEvent.CHAT_MESSAGES_STATE_SYNC_SELF}`);
        socket.off(`${SocketEvent.CHAT_MESSAGE_SEND_BROADCAST}`);
    });

    return {
        messages,
        sendMessage,
        // changeNickname
    };
}
