// src/modules/user/application/UserUseCase.ts

import { createLogger } from '@/app/utils/logger';
import { useUserStore } from '../store/userStore';

import type UserRepository from '../infrastructure/UserRepository';

const logger = createLogger('user.application');

export default class UserUseCase {
    constructor(
        private userStore: ReturnType<typeof useUserStore>,
        private userRepository: UserRepository,
    ) {}

    async fetchProfile(): Promise<void> {
        const user = await this.userRepository.fetchMe();
        this.userStore.setUser(user);
        logger.info('user fetched');
    }

    clearProfile(): void {
        this.userStore.setUser(undefined);
    }
}
