// src/modules/user/infrastructure/UserService.ts

import type { HttpClient } from '@/app/infrastructure/http/httpClient';
import type { User } from '@shared/contracts/user/User';

export default class UserService {
    constructor(private httpClient: HttpClient) {}

    getMe() {
        return this.httpClient.get<User>('/users/me');
    }
}
