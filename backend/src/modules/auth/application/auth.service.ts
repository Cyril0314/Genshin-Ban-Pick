import bcrypt from 'bcryptjs';

import { createLogger } from '../../../utils/logger';
import { InvalidPasswordError } from '../../../errors/AppError';

import type { Principal } from '@shared/contracts/auth/Principal';
import type { IJwtProvider } from '../domain/IJwtProvider';
import type UserService from '../../user/application/user.service';

const logger = createLogger('auth.service');

export default class AuthService {
    constructor(
        private userService: UserService,
        private jwtProvider: IJwtProvider,
    ) {}

    async registerMember(account: string, password: string, nickname: string): Promise<Extract<Principal, { type: 'Member' }> & { token: string }> {
        const passwordHash = await bcrypt.hash(password, 10);
        const member = await this.userService.createMember(account, passwordHash, nickname);
        const principal: Extract<Principal, { type: 'Member' }> = { type: 'Member', id: member.id, role: member.role };
        const token = this.createToken(principal, 7);
        logger.info(`register member ok account=${account} id=${member.id}`);
        return { ...principal, token };
    }

    async loginMember(account: string, password: string): Promise<Extract<Principal, { type: 'Member' }> & { token: string }> {
        const member = await this.userService.fetchMemberByAccount(account);
        const isValid = await bcrypt.compare(password, member.passwordHash);
        if (!isValid) {
            logger.warn(`login member failed: invalid password account=${account}`);
            throw new InvalidPasswordError();
        }
        const principal: Extract<Principal, { type: 'Member' }> = { type: 'Member', id: member.id, role: member.role };
        const token = this.createToken(principal, 7);
        logger.info(`login member ok account=${account} id=${member.id}`);
        return { ...principal, token };
    }

    async loginGuest(nickname: string): Promise<Extract<Principal, { type: 'Guest' }> & { token: string }> {
        const guest = await this.userService.createGuest(nickname);
        const principal: Extract<Principal, { type: 'Guest' }> = { type: 'Guest', id: guest.id };
        const token = this.createToken(principal, 180);
        logger.info(`login guest ok nickname=${nickname} id=${guest.id}`);
        return { ...principal, token };
    }

    fetchSession(token: string): Principal {
        return this.jwtProvider.verify(token);
    }

    private createToken(user: Principal, days: number) {
        return this.jwtProvider.sign(user, days);
    }
}
