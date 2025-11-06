// backend/src/routes/auth.ts

import express, { Request, Response } from 'express';

import { MissingFieldsError, UserNotFoundError, InvalidTokenError } from '../errors/AppError.ts';
import GuestService from '../services/auth/GuestService.ts';
import MemberService from '../services/auth/MemberService.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';
import { useJwt } from '../services/auth/jwt.ts';

export default function authRoutes(guestService: GuestService, memberService: MemberService) {
    const router = express.Router();
    const jwt = useJwt();

    router.post(
        '/auth/register/member',
        asyncHandler(async (req: Request, res: Response) => {
            const { account, password, nickname } = req.body;
            if (!account || !password || !nickname) {
                throw new MissingFieldsError();
            }
            const member = await memberService.register(account, password, nickname);
            const token = jwt.sign({ id: member.id, type: 'Member' }, 7);
            res.status(201).json({
                ...member,
                token,
            });
        }),
    );

    router.post(
        '/auth/login/member',
        asyncHandler(async (req: Request, res: Response) => {
            const { account, password } = req.body;
            if (!account || !password) {
                throw new MissingFieldsError();
            }
            const member = await memberService.login(account, password);
            const token = jwt.sign({ id: member.id, type: 'Member' }, 7);

            res.status(200).json({
                ...member,
                token,
            });
        }),
    );
    router.post(
        '/auth/login/guest',
        asyncHandler(async (req: Request, res: Response) => {
            const { nickname } = req.body;
            if (!nickname) {
                throw new MissingFieldsError();
            }
            const guest = await guestService.login(nickname);
            const token = jwt.sign({ id: guest.id, type: 'Guest' }, 180);

            res.status(200).json({
                ...guest,
                token,
            });
        }),
    );

    router.get(
        '/auth/session',
        asyncHandler(async (req: Request, res: Response) => {
            const authHeader = req.headers.authorization;

            if (!authHeader?.startsWith('Bearer ')) {
                throw new InvalidTokenError();
            }

            const token = authHeader.split(' ')[1];
            const payload = jwt.verify(token);
            let result;
            switch (payload.type) {
                case 'Guest':
                    result = await guestService.getById(payload.id);
                    break;
                case 'Member':
                    result = await memberService.getById(payload.id);
                    break;
                default:
                    throw new UserNotFoundError();
            }
            res.status(200).json({ type: payload.type, ...result });
        }),
    );

    return router;
}
