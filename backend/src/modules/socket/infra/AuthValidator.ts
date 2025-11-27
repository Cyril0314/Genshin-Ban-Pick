// backend/src/modules/socket/infra/AuthValidator.ts

import AuthService from "../../auth/application/auth.service";

export default class AuthValidator {
    constructor(private authService: AuthService) {}

    async verifySession(token: string) {
        const payload = await this.authService.fetchSession(token);
        return { type: payload.type, id: payload.user.id, nickname: payload.user.nickname };
    }
}
