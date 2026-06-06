// backend/src/modules/match/domain/mapTeamMember.ts

import type { TeamMember } from '@shared/contracts/team/TeamMember';

// matchTeamMember 的三欄 ref 投影（含 member/guest nickname relation）→ 領域 TeamMember。
// 輸入以結構型別描述，故不依賴 Prisma；analysis 與 match 兩個 repo 共用。
export interface ITeamMemberRefRow {
    memberRef: number | null;
    guestRef: number | null;
    name: string;
    member: { nickname: string } | null;
    guest: { nickname: string } | null;
}

export function mapTeamMember(row: ITeamMemberRefRow): TeamMember {
    if (row.memberRef && row.member) {
        return { type: 'Member', id: row.memberRef, nickname: row.member.nickname };
    }
    if (row.guestRef && row.guest) {
        return { type: 'Guest', id: row.guestRef, nickname: row.guest.nickname };
    }
    return { type: 'Name', name: row.name };
}
