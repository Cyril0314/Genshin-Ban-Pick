// backend/src/modules/auth/application/auth.service.ts

import { PrismaClient } from '@prisma/client';

import MemberService from './member.service.ts';
import GuestService from './guest.service.ts';
import { IJwtProvider } from '../domain/IJwtProvider.ts';
import { UserNotFoundError } from '../../../errors/AppError.ts';

export default class AuthService {
    private userProvider: Record<'Member' | 'Guest', { getById(id: number): Promise<any> }>;

    constructor(
        private prisma: PrismaClient,
        private memberService: MemberService,
        private guestService: GuestService,
        private jwtProvider: IJwtProvider,
    ) {
        this.userProvider = {
            Member: this.memberService,
            Guest: this.guestService,
        };
    }

    async registerMember(account: string, password: string, nickname: string) {
        const member = await this.memberService.register(account, password, nickname);
        const token = this.createToken('Member', member.id, 7);
        return {
            ...member,
            token,
        };
    }

    async loginMember(account: string, password: string) {
        const member = await this.memberService.login(account, password);
        const token = this.createToken('Member', member.id, 7);
        return {
            ...member,
            token,
        };
    }

    async loginGuest(nickname: string) {
        const guest = await this.guestService.login(nickname);
        const token = this.createToken('Guest', guest.id, 180);
        return {
            ...guest,
            token,
        };
    }

    async fetchSession(token: string) {
        const payload = this.jwtProvider.verify(token);
        const provider = this.userProvider[payload.type];

        if (!provider) throw new UserNotFoundError();

        const user = await provider.getById(payload.id);
        return {
            type: payload.type,
            ...user,
        };
    }

    private createToken(type: 'Member' | 'Guest', id: number, days: number) {
        return this.jwtProvider.sign({ id, type }, days);
    }
}
