// backend/src/modules/auth/application/guest.service.ts

import { PrismaClient } from '@prisma/client';

export default class GuestService {
    constructor(private prisma: PrismaClient) {}

    async login(nickname: string) {
        // 建立訪客
        return this.prisma.guest.create({
            data: { nickname },
        });
    }

    async getById(id: number) {
        return await this.prisma.guest.findUnique({
            where: { id },
        });
    }
}
