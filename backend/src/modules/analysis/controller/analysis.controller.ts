// backend/src/modules/analysis/controller/analysis.controller.ts

import { Request, Response } from 'express';
import AnalysisService from '../application/analysis.service';

import { parsePlayerIdentityQuery } from './query/parsePlayerIdentityQuery';
import { parseAnalysisScopeQuery } from './query/parseAnalysisScopeQuery';
import { InvalidFieldsError } from '../../../errors/AppError';

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import { parseTimeWindowQuery } from './query/parseTimeWindowQuery';

export default class AnalysisController {
    constructor(private analysisService: AnalysisService) {}

    fetchOverview = async (req: Request, res: Response) => {
        const overview = await this.analysisService.fetchOverview();
        res.status(200).json(overview);
    };

    fetchMatchTimeline = async (req: Request, res: Response) => {
        const timeWindow = parseTimeWindowQuery(req.query);
        const timeline = await this.analysisService.fetchMatchTimeline(timeWindow);
        res.status(200).json(timeline);
    };

    fetchCharacterUsageSummary = async (req: Request, res: Response) => {
        const timeWindow = parseTimeWindowQuery(req.query);
        const summary = await this.analysisService.fetchCharacterUsageSummary(timeWindow);
        res.status(200).json(summary);
    };

    fetchCharacterUsagePickPriority = async (req: Request, res: Response) => {
        const pickPriority = await this.analysisService.fetchCharacterUsagePickPriority();
        res.status(200).json(pickPriority);
    };

    fetchCharacterSynergyMatrix = async (req: Request, res: Response) => {
        const { mode } = req.query;
        const synergy = await this.analysisService.fetchCharacterSynergyMatrix(mode as SynergyMode);
        res.status(200).json(synergy);
    };

    fetchCharacterCluster = async (req: Request, res: Response) => {
        const characterClusters = await this.analysisService.fetchCharacterCluster();
        res.status(200).json(characterClusters);
    };

    fetchPlayerCharacterUsage = async (req: Request, res: Response) => {
        const usage = await this.analysisService.fetchPlayerCharacterUsage();
        res.status(200).json(usage);
    };

    fetchPlayerStyleProfile = async (req: Request, res: Response) => {
        const playerIdentity = parsePlayerIdentityQuery(req.query);
        if (!playerIdentity) throw new InvalidFieldsError();
        const style = await this.analysisService.fetchPlayerStyleProfile(playerIdentity);
        res.status(200).json(style);
    };

    fetchPlayerRecord = async (req: Request, res: Response) => {
        const playerIdentity = parsePlayerIdentityQuery(req.query);
        if (!playerIdentity) throw new InvalidFieldsError();
        const record = await this.analysisService.fetchPlayerRecord(playerIdentity);
        res.status(200).json(record);
    };

    fetchCharacterAttributeDistributions = async (req: Request, res: Response) => {
        const scope = parseAnalysisScopeQuery(req.query)
        if (!scope) throw new InvalidFieldsError();
        const distributions = await this.analysisService.fetchCharacterAttributeDistributions(scope);
        res.status(200).json(distributions);
    };
}
