// src/modules/auth/types/IMember.ts

export interface IMember {
    id: number;
    account: string;
    nickname: string;
    createdAt: Date;
    updatedAt: Date;
    role: MemberRole;
}

export enum MemberRole {
    User = 'User',
    Owner = 'Owner',
    Admin = 'Admin',
}