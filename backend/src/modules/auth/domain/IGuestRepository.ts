// src/modules/auth/domain/IGuestRepository.ts

import type { IGuestData } from "../types/IGuestData";

export interface IGuestRepository {
    create(nickname: string): Promise<IGuestData>;

    findById(id: number): Promise<IGuestData | null>;
}