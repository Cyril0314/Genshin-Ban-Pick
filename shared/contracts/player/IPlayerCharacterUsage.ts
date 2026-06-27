import type { TeamMember } from '../team/TeamMember';

export interface IPlayerCharacterUsage {
    teamMember: TeamMember;
    characterCounts: Record<string, number>;
    setupCount: number; // 總出場次數 = 所有 characterCounts 之和（rate 分母，後端提供以與 wire 上的 counts 解耦）
    signatureCharacter?: string;
}
