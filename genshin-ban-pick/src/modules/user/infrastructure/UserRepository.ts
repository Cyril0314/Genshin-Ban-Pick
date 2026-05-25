// src/modules/user/infrastructure/UserRepository.ts

import type UserService from './UserService';
import type { User } from '@shared/contracts/user/User';

export default class UserRepository {
    constructor(private userService: UserService) {}

    async fetchMe(): Promise<User> {
        const response = await this.userService.getMe();
        return response.data;
    }
}
