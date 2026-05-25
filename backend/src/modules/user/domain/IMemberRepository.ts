import type { IMemberData } from "./IMemberData";

export interface IMemberRepository {
    create(account: string, passwordHash: string, nickname: string): Promise<IMemberData>;

    existsByAccount(account: string): Promise<boolean>;

    findById(id: number): Promise<IMemberData | undefined>;

    findByAccount(account: string): Promise<IMemberData | undefined>;
}