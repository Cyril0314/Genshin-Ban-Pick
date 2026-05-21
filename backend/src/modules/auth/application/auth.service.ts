// backend/src/modules/auth/application/auth.service.ts

import MemberService from './member.service';
import GuestService from './guest.service';
import { createLogger } from '../../../utils/logger';
import { UserNotFoundError } from '../../../errors/AppError';

import type { AuthUser } from '@shared/contracts/auth/AuthUser';
import type { IJwtProvider } from '../domain/IJwtProvider';

const logger = createLogger('auth.service');
export default class AuthService {
    constructor(
        private memberService: MemberService,
        private guestService: GuestService,
        private jwtProvider: IJwtProvider,
    ) {}

    async registerMember(account: string, password: string, nickname: string): Promise<Extract<AuthUser, { type: 'Member' }> & { token: string }> {
        const member = await this.memberService.register(account, password, nickname);
        const token = this.createToken('Member', member.id, 7);
        logger.info(`register member ok account=${account} id=${member.id}`);
        return {
            type: 'Member',
            id: member.id,
            nickname: member.nickname,
            account: member.account,
            role: member.role,
            token,
        };
    }

    async loginMember(account: string, password: string): Promise<Extract<AuthUser, { type: 'Member' }> & { token: string }> {
        const member = await this.memberService.login(account, password);
        const token = this.createToken('Member', member.id, 7);
        logger.info(`login member ok account=${account} id=${member.id}`);
        return {
            type: 'Member',
            id: member.id,
            nickname: member.nickname,
            account: member.account,
            role: member.role,
            token,
        };
    }

    async loginGuest(nickname: string): Promise<Extract<AuthUser, { type: 'Guest' }> & { token: string }> {
        const guest = await this.guestService.login(nickname);
        const token = this.createToken('Guest', guest.id, 180);
        logger.info(`login guest ok nickname=${nickname} id=${guest.id}`);
        return {
            type: 'Guest',
            id: guest.id,
            nickname: guest.nickname,
            token,
        };
    }

    async fetchSession(token: string): Promise<AuthUser> {
        const payload = this.jwtProvider.verify(token);
        switch (payload.type) {
            case 'Guest':
                const guest = await this.guestService.getById(payload.id);
                if (!guest) throw new UserNotFoundError();
                return {
                    type: 'Guest',
                    id: guest.id,
                    nickname: guest.nickname,
                };
            case 'Member':
                const member = await this.memberService.getById(payload.id);
                if (!member) throw new UserNotFoundError();
                return {
                    type: 'Member',
                    id: member.id,
                    nickname: member.nickname,
                    account: member.account,
                    role: member.role,
                };
        }
    }

    private createToken(type: 'Member' | 'Guest', id: number, days: number) {
        return this.jwtProvider.sign({ id, type }, days);
    }
}
