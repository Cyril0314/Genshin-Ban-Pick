import type { IMember } from "../types/IMember";

export interface IMemberRepository {
    create(account: string, passwordHash: string, nickname: string): Promise<IMember>;

    existsByAccount(account: string): Promise<boolean>;

    findById(id: number): Promise<IMember | undefined>;

    findByAccount(account: string): Promise<IMember | undefined>;
}