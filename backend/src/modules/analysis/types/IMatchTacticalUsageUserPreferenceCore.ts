// src/modules/analysis/types/IMatchTacticalUsageUserPreferenceCore.ts

export interface IMatchTacticalUsageTeamMemberIdentityRefs {
    teamId: number;
    characterKey: string;
    setupNumber: number;
    teamMemberName: string | null;
    memberNickname: string | null;
    guestNickname: string | null;
}