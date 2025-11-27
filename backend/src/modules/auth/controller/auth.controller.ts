// backend/src/modules/auth/controller/auth.controller.ts

import { Request, Response } from 'express';
import { InvalidTokenError, MissingFieldsError } from '../../../errors/AppError';
import AuthService from '../application/auth.service';

export default class AuthController {
    constructor(private authService: AuthService) {}

    registerMember = async (req: Request, res: Response) => {
        const { account, password, nickname } = req.body;
        if (!account || !password || !nickname) {
            throw new MissingFieldsError();
        }
        const payload = await this.authService.registerMember(account, password, nickname);
        const dto = {
            id: payload.id,
            account: payload.account,
            nickname: payload.nickname,
            role: payload.role,
        };
        res.status(201).json(dto);
    };

    loginMember = async (req: Request, res: Response) => {
        const { account, password } = req.body;
        if (!account || !password) {
            throw new MissingFieldsError();
        }
        const payload = await this.authService.loginMember(account, password);
        const dto = {
            id: payload.id,
            account: payload.account,
            nickname: payload.nickname,
            role: payload.role,
            token: payload.token,
        };
        res.status(200).json(dto);
    };

    loginGuest = async (req: Request, res: Response) => {
        const { nickname } = req.body;
        if (!nickname) {
            throw new MissingFieldsError();
        }
        const payload = await this.authService.loginGuest(nickname);
        const dto = {
            id: payload.id,
            nickname: payload.nickname,
            token: payload.token,
        };
        res.status(200).json(dto);
    };

    fetchSession = async (req: Request, res: Response) => {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new InvalidTokenError();
        }
        const token = authHeader.split(' ')[1];
        const payload = await this.authService.fetchSession(token);

        const dto =
            payload.type === 'Member'
                ? {
                      type: 'Member',
                      id: payload.user.id,
                      nickname: payload.user.nickname,
                      account: payload.user.account,
                      role: payload.user.role,
                  }
                : {
                      type: 'Guest',
                      id: payload.user.id,
                      nickname: payload.user.nickname,
                  };

        res.status(200).json(dto);
    };
}
