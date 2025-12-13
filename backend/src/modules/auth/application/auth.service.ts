// backend/src/modules/auth/application/auth.service.ts

import MemberService from './member.service';
import GuestService from './guest.service';
import { createLogger } from '../../../utils/logger';
import { UserNotFoundError } from '../../../errors/AppError';

import type { IJwtProvider } from '../domain/IJwtProvider';
import type { IGuestData } from '../types/IGuestData';
import type { IMemberData } from '../types/IMemberData';

const logger = createLogger('AUTH');
export default class AuthService {
    constructor(
        private memberService: MemberService,
        private guestService: GuestService,
        private jwtProvider: IJwtProvider,
    ) {}

    async registerMember(account: string, password: string, nickname: string) {
        const member = await this.memberService.register(account, password, nickname);
        const token = this.createToken('Member', member.id, 7);
        logger.debug('Register member', member);
        return {
            ...member,
            token,
        };
    }

    async loginMember(account: string, password: string) {
        const member = await this.memberService.login(account, password);
        const token = this.createToken('Member', member.id, 7);
        logger.debug('Login member', member);
        return {
            ...member,
            token,
        };
    }

    async loginGuest(nickname: string) {
        const guest = await this.guestService.login(nickname);
        const token = this.createToken('Guest', guest.id, 180);
        logger.debug('Login guest', guest);
        return {
            ...guest,
            token,
        };
    }

    async fetchSession(token: string): Promise<{ type: 'Member'; user: IMemberData } | { type: 'Guest'; user: IGuestData }> {
        const payload = this.jwtProvider.verify(token);
        switch (payload.type) {
            case 'Guest':
                const guest = await this.guestService.getById(payload.id);
                if (!guest) throw new UserNotFoundError();
                return {
                    type: 'Guest',
                    user: guest,
                };
            case 'Member':
                const member = await this.memberService.getById(payload.id);
                if (!member) throw new UserNotFoundError();
                return {
                    type: 'Member',
                    user: member,
                };
        }
    }

    private createToken(type: 'Member' | 'Guest', id: number, days: number) {
        return this.jwtProvider.sign({ id, type }, days);
    }
}
