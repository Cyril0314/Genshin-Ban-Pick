// backend/src/modules/match/controller/match.controller.ts

import { fromTimeWindowQuery } from '@shared/contracts/common/dto/ITimeWindowQuery';
import { Request, Response } from 'express';

import { InvalidFieldsError } from '../../../errors/AppError';
import MatchService from '../application/match.service';

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

    fetchMatchTimestamps = async(req: Request, res: Response) => {
        const timeWindow = fromTimeWindowQuery(req.query);
        const timestamps = await this.matchService.fetchMatchTimestamps(timeWindow);
        res.status(200).json(timestamps);
    };
}
