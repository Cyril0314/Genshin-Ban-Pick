// src/features/ChatRoom/composables/useChat.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { useSocketStore } from '@/network/socket'
import type { IChatMessage } from '@/types/IChatMessage'

const messages = ref<IChatMessage[]>([])

export function useChat() {
    const socket = useSocketStore().getSocket()

    function sendMessage(message: string) {
        console.log(`${message}`)
        socket.emit('chat.message.send.request', {
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
        socket.on('chat.history.sync', handleHistory)
        socket.on('chat.message.send.broadcast', handleBroadcast)
    })

    onUnmounted(() => {
        socket.off('chat.history.sync', handleHistory)
        socket.off('chat.message.send.broadcast', handleBroadcast)
    })

    return {
        messages,
        sendMessage,
        // changeNickname
    }
}
