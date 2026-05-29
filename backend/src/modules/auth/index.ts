import AuthController from './controller/auth.controller';
import AuthService from './application/auth.service';
import createAuthRouter from './http/auth.routes';

import type { IJwtProvider } from './domain/IJwtProvider';
import type UserService from '../user/application/user.service';

export function createAuthModule(
    userService: UserService,
    jwtProvider: IJwtProvider,
) {
    const authService = new AuthService(userService, jwtProvider);
    const controller = new AuthController(authService);
    const router = createAuthRouter(controller);
    return { router, controller, authService };
}
