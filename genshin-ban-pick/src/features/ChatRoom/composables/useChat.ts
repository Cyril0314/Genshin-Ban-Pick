// src/features/ChatRoom/composables/useChat.ts
import { ref, onMounted, onUnmounted } from 'vue'

import type { IChatMessage } from '@/types/IChatMessage'

import { useSocketStore } from '@/network/socket'

enum SocketEvent {
    CHAT_MESSAGE_SEND_REQUEST = 'chat.message.send.request',
    CHAT_MESSAGE_SEND_BROADCAST = 'chat.message.send.broadcast',

    CHAT_MESSAGES_STATE_SYNC = 'chat.messages.state.sync',
}

const messages = ref<IChatMessage[]>([])

export function useChat() {
    const socket = useSocketStore().getSocket()

    function sendMessage(message: string) {
        console.log(`${message}`)
        socket.emit(`${SocketEvent.CHAT_MESSAGE_SEND_REQUEST}`, {
            message,
            senderId: socket.id
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

    function handleHistory(history: IChatMessage[]) {
        messages.value = history
    }

    function handleBroadcast(msg: IChatMessage) {
        if (msg.senderId !== socket.id) {
            messages.value.push(msg)
        }
    }

    onMounted(() => {
        socket.on(`${SocketEvent.CHAT_MESSAGES_STATE_SYNC}`, handleHistory)
        socket.on(`${SocketEvent.CHAT_MESSAGE_SEND_BROADCAST}`, handleBroadcast)
    })

    onUnmounted(() => {
        socket.off(`${SocketEvent.CHAT_MESSAGES_STATE_SYNC}`, handleHistory)
        socket.off(`${SocketEvent.CHAT_MESSAGE_SEND_BROADCAST}`, handleBroadcast)
    })

    return {
        messages,
        sendMessage,
        // changeNickname
    }
}
