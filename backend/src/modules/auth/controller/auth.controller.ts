// backend/src/modules/auth/controller/auth.controller.ts

import { Request, Response } from 'express';
import { InvalidTokenError, MissingFieldsError, UserNotFoundError } from '../../../errors/AppError.ts';
import AuthService from '../application/auth.service.ts';

export default class AuthController {
    constructor(private authService: AuthService) {}

    registerMember = async (req: Request, res: Response) => {
        const { account, password, nickname } = req.body;
        if (!account || !password || !nickname) {
            throw new MissingFieldsError();
        }
        const payload = await this.authService.registerMember(account, password, nickname);
        res.status(201).json(payload);
    };

    loginMember = async (req: Request, res: Response) => {
        const { account, password } = req.body;
        if (!account || !password) {
            throw new MissingFieldsError();
        }
        const payload = await this.authService.loginMember(account, password);
        res.status(200).json(payload);
    };

    loginGuest = async (req: Request, res: Response) => {
        const { nickname } = req.body;
        if (!nickname) {
            throw new MissingFieldsError();
        }
        const payload = await this.authService.loginGuest(nickname);

        res.status(200).json(payload);
    };

    fetchSession = async (req: Request, res: Response) => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new InvalidTokenError();
        }
        const token = authHeader.split(' ')[1];
        const payload = await this.authService.fetchSession(token);
        res.status(200).json(payload);
    };
}
