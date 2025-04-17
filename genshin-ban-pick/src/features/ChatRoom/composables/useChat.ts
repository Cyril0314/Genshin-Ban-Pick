// useChat.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { useInjectedSocket } from '@/network/SocketProvider'
import type { ChatMessage } from '@/network/socket'

const messages = ref<ChatMessage[]>([])
const nickname = ref(localStorage.getItem('nickname') || prompt("輸入暱稱:") || 'Anonymous')

localStorage.setItem('nickname', nickname.value)

export function useChat() {
    const socket = useInjectedSocket()

    function sendMessage(message: string) {
        console.log(`${message}`)
        socket.emit('chat.message.send.request', {
            senderName: nickname.value,
            message,
            senderId: socket.id
        })

        messages.value.push({
            senderName: nickname.value,
            message
        })
    }

    function changeNickname() {
        const newName = prompt('輸入暱稱:', nickname.value)
        if (newName && newName !== nickname.value) {
            nickname.value = newName
            localStorage.setItem('nickname', newName)
        }
    }

    function handleHistory(history: ChatMessage[]) {
        messages.value = history
    }

    function handleBroadcast(msg: ChatMessage) {
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
        nickname,
        sendMessage,
        changeNickname
    }
}
