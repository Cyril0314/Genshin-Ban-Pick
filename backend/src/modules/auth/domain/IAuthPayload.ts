// backend/src/services/auth/IAuthPayload.ts

export interface IAuthPayload {
  id: number;
  type: "Member" | "Guest";
}