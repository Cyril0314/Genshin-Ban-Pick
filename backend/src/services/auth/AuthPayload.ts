// backend/src/services/auth/AuthPayload.ts

export interface AuthPayload {
  id: number;
  type: "MEMBER" | "GUEST";
}