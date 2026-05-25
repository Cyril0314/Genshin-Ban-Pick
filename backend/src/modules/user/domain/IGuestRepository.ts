import type { IGuestData } from "./IGuestData";

export interface IGuestRepository {
    create(nickname: string): Promise<IGuestData>;

    findById(id: number): Promise<IGuestData | undefined>;
}