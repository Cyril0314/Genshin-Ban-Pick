// src/modules/auth/domain/IGuestRepository.ts

import { IGuestData } from "../types/IGuestData";

export default interface IGuestRepository {
    create(nickname: string): Promise<IGuestData>;

    findById(id: number): Promise<IGuestData | null>;
}