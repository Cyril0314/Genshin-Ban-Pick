// src/modules/user/registerUserDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import UserUseCase from './application/UserUseCase';
import UserRepository from './infrastructure/UserRepository';
import UserService from './infrastructure/UserService';

import type { useUserStore } from './store/userStore';
import type { HttpClient } from '@/app/infrastructure/http/httpClient';
import type { App } from 'vue';

export function registerUserDependencies(app: App, httpClient: HttpClient, userStore: ReturnType<typeof useUserStore>) {
    const userService = new UserService(httpClient);
    const userRepository = new UserRepository(userService);
    const userUseCase = new UserUseCase(userStore, userRepository);

    app.provide(DIKeys.UserUseCase, userUseCase);
    return { userUseCase };
}
