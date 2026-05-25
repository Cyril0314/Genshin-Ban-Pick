import type { Identity } from "../identity/Identity";

export type User =
    | (Extract<Identity, { type: 'Member' }> & { nickname: string; account: string })
    | (Extract<Identity, { type: 'Guest' }> & { nickname: string });
