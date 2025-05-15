// src/network/socket.ts
// 建立 Socket 實例

import { io, type Socket } from 'socket.io-client'

const baseURL = import.meta.env.VITE_SOCKET_URL
let socketInstance: Socket | null = null

export function initSocketConnection(): Socket {
  const token = localStorage.getItem('auth_token')
  let guestId = localStorage.getItem('guest_id')

  if (!token && !guestId) {
    guestId = `guest_${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem('guest_id', guestId)
  }

  socketInstance = io(baseURL, {
    auth: token ? { token } : { guestId },
  })

  const roomId = new URLSearchParams(window.location.search).get('room') || 'default-room'

  socketInstance.on('connect', () => {
    console.log('[Client] Connected:', socketInstance!.id)
    socketInstance!.emit('room.join.request', roomId)
  })

  socketInstance.on('disconnected', () => {
    console.log('[Client] Disconnected')
  })

  return socketInstance
}

export function getSocketInstance(): Socket {
  if (!socketInstance) throw new Error('Socket 未初始化')
  return socketInstance
}
