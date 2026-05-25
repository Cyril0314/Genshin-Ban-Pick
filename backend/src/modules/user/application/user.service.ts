import { createLogger } from '../../../utils/logger';
import { UserExistsError, UserNotFoundError } from '../../../errors/AppError';

import type { IMemberRepository } from '../domain/IMemberRepository';
import type { IGuestRepository } from '../domain/IGuestRepository';
import type { IMemberData } from '../types/IMemberData';
import type { IGuestData } from '../types/IGuestData';
import type { User } from '@shared/contracts/user/User';
import type { Identity } from '@shared/contracts/identity/Identity';

const logger = createLogger('user.service');

export default class UserService {
    constructor(
        private memberRepository: IMemberRepository,
        private guestRepository: IGuestRepository,
    ) {}

    async createMember(account: string, passwordHash: string, nickname: string): Promise<IMemberData> {
        const exists = await this.memberRepository.existsByAccount(account);
        if (exists) {
            logger.warn(`create member failed: account exists account=${account}`);
            throw new UserExistsError();
        }
        const member = await this.memberRepository.create(account, passwordHash, nickname);
        logger.debug(`create member ok account=${account} id=${member.id}`);
        return member;
    }

    async createGuest(nickname: string): Promise<IGuestData> {
        const guest = await this.guestRepository.create(nickname);
        logger.debug(`create guest ok id=${guest.id}`);
        return guest;
    }

    async fetchMemberByAccount(account: string): Promise<IMemberData> {
        const member = await this.memberRepository.findByAccount(account);
        if (!member) throw new UserNotFoundError();
        return member;
    }

    async fetchMemberById(id: number): Promise<IMemberData> {
        const member = await this.memberRepository.findById(id);
        if (!member) throw new UserNotFoundError();
        return member;
    }

    async fetchGuestById(id: number): Promise<IGuestData> {
        const guest = await this.guestRepository.findById(id);
        if (!guest) throw new UserNotFoundError();
        return guest;
    }

    async fetchUser(identity: Identity): Promise<User> {
        if (identity.type === 'Member') {
            const member = await this.memberRepository.findById(identity.id);
            if (!member) throw new UserNotFoundError();
            logger.debug(`get member profile id=${identity.id}`);
            return { type: 'Member', id: member.id, nickname: member.nickname, account: member.account };
        } else {
            const guest = await this.guestRepository.findById(identity.id);
            if (!guest) throw new UserNotFoundError();
            logger.debug(`get guest profile id=${identity.id}`);
            return { type: 'Guest', id: guest.id, nickname: guest.nickname };
        }
    }
}
