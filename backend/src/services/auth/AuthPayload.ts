// backend/src/services/auth/AuthPayload.ts

export interface AuthPayload {
  id: number;
  type: "Member" | "Guest";
}