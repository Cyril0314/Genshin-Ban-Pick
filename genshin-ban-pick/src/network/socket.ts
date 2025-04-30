// src/network/socket.ts
// 建立 Socket 實例

import { io, type Socket } from 'socket.io-client'
const baseURL = import.meta.env.VITE_SOCKET_URL

export const roomId = new URLSearchParams(window.location.search).get('room') || 'default-room'

console.log(`baseURL ${baseURL}`)
export const socket: Socket = io(baseURL, {
    autoConnect: true
  })

export interface ChatMessage {
    senderName: string
    message: string
    timestamp?: number
    senderId?: string
}

export interface ServerToClientEvents {
    'chat.history.sync': (history: ChatMessage[]) => void
    'chat.message.send.broadcast': (msg: ChatMessage) => void
}

export interface ClientToServerEvents {
    'chat.message.send.request': (msg: ChatMessage) => void
    'room.join.request': (roomId: string) => void
}

socket.on('connect', () => {
    console.log('[Client] Connected to server with ID:', socket.id);
    socket.emit('room.join.request', roomId)
})

socket.on('disconnect', () => {
    console.warn('[Client] Disconnected')
})