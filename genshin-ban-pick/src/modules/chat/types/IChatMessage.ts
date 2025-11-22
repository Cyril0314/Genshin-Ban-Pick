// src/modules/chat/types/IChatMessage.ts

export interface IChatMessage {
    nickname: string
    message: string
    timestamp?: number
    isSelf: boolean
}