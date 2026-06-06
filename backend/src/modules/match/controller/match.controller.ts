// backend/src/modules/match/controller/match.controller.ts

import { Request, Response } from 'express';
import MatchService from '../application/match.service';
import { InvalidFieldsError } from '../../../errors/AppError';

export default class MatchController {
    constructor(private matchService: MatchService) {}

    saveMatch = async(req: Request, res: Response) => {
        const { roomId } = req.body;
        const matchData = await this.matchService.saveMatch(roomId);
        res.status(200).json(matchData);
    };

    fetchMatch = async(req: Request, res: Response) => {
        const matchId = Number(req.params.matchId);
        if (Number.isNaN(matchId)) throw new InvalidFieldsError();
        const match = await this.matchService.fetchMatch(matchId);
        res.status(200).json(match);
    };

    deleteMatch = async(req: Request, res: Response) => {
        const matchId = Number(req.params.matchId);
        if (Number.isNaN(matchId)) throw new InvalidFieldsError();
        await this.matchService.deleteMatch(matchId);
        res.status(204).end();
    };

    fetchMatchTeamMembers = async(req: Request, res: Response) => {
        const matchTeamMembers = await this.matchService.fetchMatchTeamMembers();
        res.status(200).json(matchTeamMembers);
    };
}
