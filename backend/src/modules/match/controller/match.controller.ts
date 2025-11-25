// backend/src/modules/match/controller/match.controller.ts

import { Request, Response } from 'express';
import MatchService from '../application/match.service.ts';

export default class MatchController {
    constructor(private matchService: MatchService) {}

    saveMatch = async(req: Request, res: Response) => {
        const { roomId } = req.body;
        const matchData = await this.matchService.saveMatch(roomId);
        res.status(200).json(matchData);
    };
}
