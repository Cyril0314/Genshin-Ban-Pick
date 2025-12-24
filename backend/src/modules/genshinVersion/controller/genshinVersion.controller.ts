// backend/src/modules/genshinVersion/controller/genshinVersion.controller.ts

import { Request, Response } from 'express';
import GenshinVersionService from '../application/genshinVersion.service';

export default class GenshinVersionController {
    constructor(private genshinVersionService: GenshinVersionService) {}

    fetchChfetchGenshinVersionPeriodsaracters = async(req: Request, res: Response) => {
        const periods = await this.genshinVersionService.fetchGenshinVersionPeriods();
        res.status(200).json(periods);
    };
}
