// src/modules/auth/infra/MemberRepository.ts

import { PrismaClient } from '@prisma/client';

import type { Member } from '@prisma/client';
import type { MemberRole } from '@shared/contracts/auth/value_types'
import type { IMemberRepository } from '../domain/IMemberRepository';
import type { IMemberData } from '../types/IMemberData';

export default class MemberRepository implements IMemberRepository {
    constructor(private prisma: PrismaClient) {}

    async create(account: string, passwordHash: string, nickname: string) {
        const member = await this.prisma.member.create({
            data: { account, passwordHash, nickname },
        });
        return this.map(member)
    }

    async existsByAccount(account: string) {
        const result = await this.prisma.member.findFirst({
            where: { account },
            select: { id: true },
        });
        return result !== null;
    }

    async findById(id: number) {
        const member = await this.prisma.member.findUnique({
            where: { id },
        });
        if (!member) return null;
        return this.map(member)
    }

    async findByAccount(account: string) {
        const member =  await this.prisma.member.findUnique({ where: { account } });
        if (!member) return null;
        return this.map(member)
    }

    private map(member: Member): IMemberData {
        return {
            id: member.id,
            account: member.account,
            passwordHash: member.passwordHash,
            nickname: member.nickname,
            role: member.role as MemberRole
        }
    }
}
