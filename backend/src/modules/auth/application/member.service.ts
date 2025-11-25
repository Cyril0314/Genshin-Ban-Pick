// backend/src/modules/auth/application/member.service.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { UserExistsError, UserNotFoundError, InvalidPasswordError } from '../../../errors/AppError.ts';

export default class MemberService {
    constructor(private prisma: PrismaClient) {}

    async register(account: string, password: string, nickname: string) {
        // 檢查帳號是否存在
        const existing = await this.prisma.member.findUnique({ where: { account } });
        if (existing) throw new UserExistsError();

        // 密碼加密
        const passwordHash = await bcrypt.hash(password, 10);

        // 建立用戶
        return await this.prisma.member.create({
            data: { account, passwordHash, nickname },
        });
    }

    async getById(id: number) {
        return await this.prisma.member.findUnique({
            where: { id },
        });
    }

    async login(account: string, password: string) {
        const member = await this.prisma.member.findUnique({ where: { account } });
        if (!member) throw new UserNotFoundError();

        const isValid = await bcrypt.compare(password, member.passwordHash);
        if (isValid) {
            return member;
        } else {
            throw new InvalidPasswordError();
        }
    }
}
