// backend/src/modules/auth/domain/IAuthPayload.ts

export interface IAuthPayload {
  id: number;
  type: "Member" | "Guest";
}