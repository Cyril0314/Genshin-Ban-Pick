// backend/src/modules/analysis/controller/analysis.controller.ts

import { fromTimeWindowQuery } from '@shared/contracts/common/dto/ITimeWindowQuery';
import { fromPlayerIdentityQuery } from '@shared/contracts/identity/dto/IPlayerIdentityQuery';
import { Request, Response } from 'express';

import { InvalidFieldsError } from '../../../errors/AppError';
import AnalysisService from '../application/analysis.service';


import type { CooccurrenceGrain } from '@shared/contracts/analysis/value-types';

export default class AnalysisController {
    constructor(private analysisService: AnalysisService) {}

    fetchOverview = async (req: Request, res: Response) => {
        const overview = await this.analysisService.fetchOverview();
        res.status(200).json(overview);
    };

    fetchCharacterUsageSummary = async (req: Request, res: Response) => {
        const timeWindow = fromTimeWindowQuery(req.query);
        const summary = await this.analysisService.fetchCharacterUsageSummary(timeWindow);
        res.status(200).json(summary);
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

    fetchCharacterAttributeDistributions = async (req: Request, res: Response) => {
        const playerIdentity = fromPlayerIdentityQuery(req.query);
        // identity 選填（無 → 全域）；但有帶 type 卻 parse 不出 = malformed，回 400，不可靜默退回全域
        if (req.query.type !== undefined && !playerIdentity) throw new InvalidFieldsError();
        const distributions = await this.analysisService.fetchCharacterAttributeDistributions(playerIdentity);
        res.status(200).json(distributions);
    };
}
