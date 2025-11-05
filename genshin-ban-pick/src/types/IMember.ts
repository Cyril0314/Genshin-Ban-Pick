// src/type/IMember.ts

export interface IMember {
    id: number;
    account: string;
    nickname: string;
    createdAt: Date;
    updatedAt: Date;
    role: Role;
}

export enum Role {
    USER = 'USER',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
}