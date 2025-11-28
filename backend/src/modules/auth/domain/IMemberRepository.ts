// src/modules/auth/domain/IMemberRepository.ts

import type { IMemberData } from "../types/IMemberData";

export interface IMemberRepository {
    create(account: string, passwordHash: string, nickname: string): Promise<IMemberData>;

    existsByAccount(account: string): Promise<boolean>;

    findById(id: number): Promise<IMemberData | null>;

    findByAccount(account: string): Promise<IMemberData | null>;
}