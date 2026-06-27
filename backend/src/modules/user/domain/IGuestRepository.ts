import type { IGuest } from "../types/IGuest";

export interface IGuestRepository {
    create(nickname: string): Promise<IGuest>;

    findById(id: number): Promise<IGuest | undefined>;
}