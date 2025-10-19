// backend/src/type/IChatMessage.ts

export interface IChatMessage {
  senderName: string;
  message: string;
  timestamp: number;
}