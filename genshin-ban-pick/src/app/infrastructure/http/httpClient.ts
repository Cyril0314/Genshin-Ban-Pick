// src/infrastructure/http/httpClient.ts

import axios from 'axios';
import { TokenNotFound } from '@/app/errors/AppError';

let tokenProvider: (() => string | undefined) | undefined = undefined;

export function setTokenProvider(fn: () => string | undefined) {
    tokenProvider = fn;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const withToken = config.withToken ?? true;

    if (withToken) {
        const token = tokenProvider ? tokenProvider() : undefined;
        if (!token) throw new TokenNotFound();

        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

declare module 'axios' {
    export interface AxiosRequestConfig {
        withToken?: boolean;
    }
}

export type HttpClient = typeof api;
export default api;
