import type { TeamMember } from '../team/TeamMember';

// 玩家名冊中的一筆：基本身分 + 參與場次 + 使用角色數（給 player 列表用）
export interface IPlayerSummary {
    teamMember: TeamMember;
    matchCount: number; // 參與過的場次數（同隊成員去重後的出場計數）
    characterCount: number; // 使用過的不重複角色數
    signatureCharacter?: string; // 本命角色：被選次數最多的 characterKey（無出場紀錄時 undefined）
}
