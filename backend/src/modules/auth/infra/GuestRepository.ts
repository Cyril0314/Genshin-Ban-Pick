// src/modules/auth/infra/GuestRepository.ts

import { PrismaClient } from '@prisma/client';

import type { Guest } from '@prisma/client';
import type { IGuestRepository } from '../domain/IGuestRepository';
import type { IGuestData } from '../types/IGuestData';

export default class GuestRepository implements IGuestRepository {
    constructor(private prisma: PrismaClient) {}

    async create(nickname: string) {
        const guest = await this.prisma.guest.create({
            data: { nickname },
        });
        return this.map(guest);
    }

    async findById(id: number) {
        const guest = await this.prisma.guest.findUnique({
            where: { id },
        });
        if (!guest) return undefined;
        return this.map(guest);
    }

    private map(guest: Guest): IGuestData {
        return {
            id: guest.id,
            nickname: guest.nickname,
        };
    }
}
