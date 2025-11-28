// backend/src/modules/auth/application/guest.service.ts

import type { IGuestRepository } from '../domain/IGuestRepository';

export default class GuestService {
    constructor(private guestRepository: IGuestRepository) {}

    async login(nickname: string) {
        // 建立訪客
        return await this.guestRepository.create(nickname)
    }

    async getById(id: number) {
        return await this.guestRepository.findById(id)
    }
}
