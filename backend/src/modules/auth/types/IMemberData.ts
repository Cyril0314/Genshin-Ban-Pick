import { MemberRole } from '@shared/contracts/auth/value_type'

export interface IMemberData {
    id: number;
    account: string;
    nickname: string;
    passwordHash: string;
    role: MemberRole;
}