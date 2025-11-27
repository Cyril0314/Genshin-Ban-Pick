// backend/src/modules/auth/application/member.service.ts

import bcrypt from 'bcryptjs';

import { UserExistsError, UserNotFoundError, InvalidPasswordError } from '../../../errors/AppError';
import IMemberRepository from '../domain/IMemberRepository';

export default class MemberService {
    constructor(private memberRepository: IMemberRepository) {}

    async register(account: string, password: string, nickname: string) {
        // 檢查帳號是否存在
        const existing = await this.memberRepository.existsByAccount(account)
        if (existing) throw new UserExistsError();

        // 密碼加密
        const passwordHash = await bcrypt.hash(password, 10);

        // 建立用戶
        return await this.memberRepository.create(account, passwordHash, nickname )
    }

    async getById(id: number) {
        return await this.memberRepository.findById(id)
    }

    async login(account: string, password: string) {
        const member = await this.memberRepository.findByAccount(account)
        if (!member) throw new UserNotFoundError();

        const isValid = await bcrypt.compare(password, member.passwordHash);
        if (isValid) {
            return member;
        } else {
            throw new InvalidPasswordError();
        }
    }
}
