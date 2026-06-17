// backend/src/modules/analysis/controller/analysis.controller.ts

import { fromTimeWindowQuery } from '@shared/contracts/common/dto/ITimeWindowQuery';
import { fromPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';
import { Request, Response } from 'express';

import { InvalidFieldsError } from '../../../errors/AppError';
import AnalysisService from '../application/analysis.service';


import type { CooccurrenceGrain } from '@shared/contracts/analysis/value-types';

export default class AnalysisController {
    constructor(private analysisService: AnalysisService) {}

    fetchMatchOverview = async (req: Request, res: Response) => {
        const overview = await this.analysisService.fetchMatchOverview();
        res.status(200).json(overview);
    };

    fetchCharacterUsageSummary = async (req: Request, res: Response) => {
        const timeWindow = fromTimeWindowQuery(req.query);
        const summary = await this.analysisService.fetchCharacterUsageSummary(timeWindow);
        res.status(200).json(summary);
    };
    
    fetchCharacterUsageCounts = async (req: Request, res: Response) => {
        const counts = await this.analysisService.fetchCharacterUsageCounts();
        res.status(200).json(counts);
    };

    fetchCharacterUsagePickPriority = async (req: Request, res: Response) => {
        const pickPriority = await this.analysisService.fetchCharacterUsagePickPriority();
        res.status(200).json(pickPriority);
    };

    fetchCharacterCooccurrenceMatrix = async (req: Request, res: Response) => {
        const { grain } = req.query;
        const matrix = await this.analysisService.fetchCharacterCooccurrenceMatrix(grain as CooccurrenceGrain);
        res.status(200).json(matrix);
    };

    fetchCharacterCluster = async (req: Request, res: Response) => {
        const characterClusters = await this.analysisService.fetchCharacterCluster();
        res.status(200).json(characterClusters);
    };

    fetchPlayerStyle = async (req: Request, res: Response) => {
        const playerIdentity = fromPlayerIdentityQuery(req.query);
        if (!playerIdentity) throw new InvalidFieldsError();
        const style = await this.analysisService.fetchPlayerStyle(playerIdentity);
        res.status(200).json(style);
    };
}
