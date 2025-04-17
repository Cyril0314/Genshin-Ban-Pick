// src/network/SocketProvider.ts
// 依賴注入 Socket

import type { App } from 'vue'
import { inject } from 'vue'
import type { Socket } from 'socket.io-client'
import { socket } from './socket'


const SocketSymbol = Symbol('Socket')

export function provideSocket(app: App) {
    app.provide(SocketSymbol, socket)
}

export function useInjectedSocket(): Socket {
    const s = inject(SocketSymbol)
    if (!s) throw new Error('Socket not provided')
    return s as Socket
}