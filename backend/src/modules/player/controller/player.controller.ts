// src/modules/player/controller/player.controller.ts

import { fromPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';
import { Request, Response } from 'express';

import { InvalidFieldsError } from '../../../errors/AppError';
import PlayerService from '../application/player.service';

export default class PlayerController {
    constructor(private playerService: PlayerService) {}

    fetchPlayers = async (_req: Request, res: Response) => {
        const players = await this.playerService.fetchPlayers();
        res.status(200).json(players);
    };

    fetchPlayerRecord = async (req: Request, res: Response) => {
        const playerIdentity = fromPlayerIdentityQuery(req.query);
        if (!playerIdentity) throw new InvalidFieldsError();
        const record = await this.playerService.fetchPlayerRecord(playerIdentity);
        res.status(200).json(record);
    };

    fetchPlayerMatches = async (req: Request, res: Response) => {
        const playerIdentity = fromPlayerIdentityQuery(req.query);
        if (!playerIdentity) throw new InvalidFieldsError();
        const matches = await this.playerService.fetchPlayerMatches(playerIdentity);
        res.status(200).json(matches);
    };

    fetchPlayerTeammates = async (req: Request, res: Response) => {
        const playerIdentity = fromPlayerIdentityQuery(req.query);
        if (!playerIdentity) throw new InvalidFieldsError();
        const teammates = await this.playerService.fetchPlayerTeammates(playerIdentity);
        res.status(200).json(teammates);
    };
}
