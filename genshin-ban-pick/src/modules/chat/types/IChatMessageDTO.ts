// src/modules/chat/types/IChatMessageDTO.ts

export interface IChatMessageDTO {
    identityKey: string
    nickname: string
    message: string
    timestamp?: number
}