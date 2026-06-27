import { PrismaClient } from '@prisma/client';

import type { Guest } from '@prisma/client';
import type { IGuestRepository } from '../domain/IGuestRepository';
import type { IGuest } from '../types/IGuest';

export default class GuestRepository implements IGuestRepository {
    constructor(private prisma: PrismaClient) {}

    async create(nickname: string): Promise<IGuest> {
        const guest = await this.prisma.guest.create({
            data: { nickname },
        });
        return this.map(guest);
    }

    async findById(id: number): Promise<IGuest | undefined> {
        const guest = await this.prisma.guest.findUnique({
            where: { id },
        });
        if (!guest) return undefined;
        return this.map(guest);
    }

    private map(guest: Guest): IGuest {
        return {
            id: guest.id,
            nickname: guest.nickname,
        };
    }
}
