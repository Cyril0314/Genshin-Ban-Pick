// src/modules/auth/infrastructure/storage/tokenStorage.ts

export const tokenStorage = {
  get() {
    return localStorage.getItem("auth_token") ?? undefined;
  },
  set(token: string | undefined) {
    if (token === undefined) return localStorage.removeItem("auth_token");
    localStorage.setItem("auth_token", token);
  }
};