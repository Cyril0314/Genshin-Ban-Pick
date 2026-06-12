// src/modules/match/domain/mapPlayerIdentity.ts

import type { PlayerIdentity } from '@shared/contracts/identity/PlayerIdentity';

// matchTeamMember 的 memberRef/guestRef/name 三選一 → PlayerIdentity（Member 優先，再 Guest，否則歷史 Name）
export function mapPlayerIdentity(member: { memberRef: number | null; guestRef: number | null; name: string }): PlayerIdentity {
    if (member.memberRef) return { type: 'Member', id: member.memberRef };
    if (member.guestRef) return { type: 'Guest', id: member.guestRef };
    return { type: 'Name', name: member.name };
}
