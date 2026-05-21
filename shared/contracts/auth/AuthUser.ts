import type { MemberRole } from './value_types';

export type AuthUser =
    | { type: 'Member'; id: number; account: string; nickname: string; role: MemberRole }
    | { type: 'Guest'; id: number; nickname: string };
