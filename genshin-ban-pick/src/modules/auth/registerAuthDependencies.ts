// src/modules/auth/registerAuthDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import AuthUseCase from './application/AuthUseCase';
import AuthRepository from './infrastructure/AuthRepository';
import AuthService from './infrastructure/AuthService';
import type { useAuthStore } from './store/authStore';

import type { HttpClient } from '../../app/infrastructure/http/httpClient';
import type { App } from 'vue';

export function registerAuthDependencies(app: App, httpClient: HttpClient, authStore: ReturnType<typeof useAuthStore>,) {
    const authService = new AuthService(httpClient)
    const authRepository = new AuthRepository(authService)
    const authUseCase = new AuthUseCase(authStore, authRepository)

    app.provide(DIKeys.AuthUseCase, authUseCase);
}
