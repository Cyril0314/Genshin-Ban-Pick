// src/types/ChatMessage.ts

export interface ChatMessage {
    senderName: string
    message: string
    timestamp?: number
    senderId?: string
}