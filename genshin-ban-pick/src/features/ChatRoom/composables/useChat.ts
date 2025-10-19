// src/features/ChatRoom/composables/useChat.ts
import { ref, onMounted, onUnmounted } from 'vue'

import type { IChatMessage } from '@/types/IChatMessage'

import { useSocketStore } from '@/network/socket'

enum SocketEvent {
    CHAT_MESSAGE_SEND_REQUEST = 'chat.message.send.request',
    CHAT_MESSAGE_SEND_BROADCAST = 'chat.message.send.broadcast',

    CHAT_MESSAGES_STATE_SYNC_SELF = 'chat.messages.state.sync.self',
}

const messages = ref<IChatMessage[]>([])

export function useChat() {
    const socket = useSocketStore().getSocket()

    function sendMessage(message: string) {
        console.log(`${message}`)
        socket.emit(`${SocketEvent.CHAT_MESSAGE_SEND_REQUEST}`, {
            message
        })

        messages.value.push({
            senderName: `我`,
            message
        })
    }

    // function changeNickname() {
    //     const newName = prompt('輸入暱稱:', nickname.value)
    //     if (newName && newName !== nickname.value) {
    //         nickname.value = newName
    //         localStorage.setItem('nickname', newName)
    //     }
    // }

    function handleChatMessagesStateSync(history: IChatMessage[]) {
        messages.value = history
    }

    function handleChatMessageSendBroadcast(msg: IChatMessage) {
        messages.value.push(msg)
    }

    onMounted(() => {
        socket.on(`${SocketEvent.CHAT_MESSAGES_STATE_SYNC_SELF}`, handleChatMessagesStateSync)
        socket.on(`${SocketEvent.CHAT_MESSAGE_SEND_BROADCAST}`, handleChatMessageSendBroadcast)
    })

    onUnmounted(() => {
        socket.off(`${SocketEvent.CHAT_MESSAGES_STATE_SYNC_SELF}`)
        socket.off(`${SocketEvent.CHAT_MESSAGE_SEND_BROADCAST}`)
    })

    return {
        messages,
        sendMessage,
        // changeNickname
    }
}
