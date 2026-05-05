// src/utils/nullable.ts

export const orUndefined = <T>(v: T | null | undefined): T | undefined => v ?? undefined;      