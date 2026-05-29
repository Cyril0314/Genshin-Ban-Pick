import type { Request, Response } from 'express';
import type UserService from '../application/user.service';

export default class UserController {
    constructor(private userService: UserService) {}

    getMe = async (req: Request, res: Response) => {
        const profile = await this.userService.fetchUser(req.user!);
        res.status(200).json(profile);
    };
}
