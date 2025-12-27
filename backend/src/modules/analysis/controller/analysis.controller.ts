// backend/src/modules/analysis/controller/analysis.controller.ts

import { Request, Response } from 'express';
import AnalysisService from '../application/analysis.service';

import { parsePlayerIdentityQuery } from './query/parsePlayerIdentityQuery';
import { parseAnalysisScopeQuery } from './query/parseAnalysisScopeQuery';

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
        const tacticalUsages = await this.analysisService.fetchCharacterUsageSummary(timeWindow);
        res.status(200).json(tacticalUsages);
    };

    fetchCharacterUsagePickPriority = async (req: Request, res: Response) => {
        const result = await this.analysisService.fetchCharacterUsagePickPriority();
        res.status(200).json(result);
    };

    fetchCharacterSynergyMatrix = async (req: Request, res: Response) => {
        const { mode } = req.query;
        const synergy = await this.analysisService.fetchCharacterSynergyMatrix(mode as SynergyMode);
        res.status(200).json(synergy);
    };

    fetchCharacterSynergyGraph = async (req: Request, res: Response) => {
        const graph = await this.analysisService.fetchCharacterSynergyGraph();
        res.status(200).json(graph);
    };

    fetchCharacterCluster = async (req: Request, res: Response) => {
        const characterClusters = await this.analysisService.fetchCharacterCluster();
        res.status(200).json(characterClusters);
    };

    fetchPlayerCharacterUsage = async (req: Request, res: Response) => {
        const preference = await this.analysisService.fetchPlayerCharacterUsage();
        res.status(200).json(preference);
    };

    fetchPlayerStyleProfile = async (req: Request, res: Response) => {
        const identityKey = parsePlayerIdentityQuery(req.query);
        const style = await this.analysisService.fetchPlayerStyleProfile(identityKey);
        res.status(200).json(style);
    };

    fetchCharacterAttributeDistributions = async (req: Request, res: Response) => {
        const scope = parseAnalysisScopeQuery(req.query)
        const distributions = await this.analysisService.fetchCharacterAttributeDistributions(scope);
        res.status(200).json(distributions);
    };
}
