// src/modules/auth/types/IMember.ts

import { MemberRole } from '@shared/contracts/auth/value_types'

export interface IMember {
    id: number;
    account: string;
    nickname: string;
    role: MemberRole;
}
