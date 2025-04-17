// src/network/useSocket.ts
// 使用 Socket

import { ref, onUnmounted } from 'vue'
import { useInjectedSocket } from './SocketProvider'

export function useSocket() {
    const socket = useInjectedSocket()

    const connected = ref(socket.connected)
    const socketId = ref(socket.id)

    const listeners: [string, Function][] = []

    socket.on('connect', () => {
        connected.value = true
        socketId.value = socket.id
        console.log('[useSocket] Connected:', socket.id)
    })

    socket.on('disconnect', () => {
        connected.value = false
        console.warn('[useSocket] Disconnected')
    })

    function on(event: string, callback: Function) {
        socket.on(event, callback)
        listeners.push([event, callback])
    }

    function emit(event: string, data?: any) {
        socket.emit(event, data)
    }

    // 清理註冊事件，避免 memory leak
    onUnmounted(() => {
        listeners.forEach(([event, callback]) => {
            socket.off(event, callback)
        })
    })

    return {
        connected,
        socketId,
        emit,
        on
    }
}