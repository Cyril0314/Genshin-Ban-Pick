// src/modules/auth/domain/IMemberRepository.ts

import { IMemberData } from "../types/IMemberData";

export default interface IMemberRepository {
    create(account: string, passwordHash: string, nickname: string): Promise<IMemberData>;

    existsByAccount(account: string): Promise<boolean>;

    findById(id: number): Promise<IMemberData | null>;

    findByAccount(account: string): Promise<IMemberData | null>;
}