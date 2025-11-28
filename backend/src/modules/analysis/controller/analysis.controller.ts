// backend/src/modules/analysis/controller/analysis.controller.ts

import { Request, Response } from 'express';
import AnalysisService from '../application/analysis.service';

import type { SynergyMode } from '@shared/contracts/analysis/value-types';

export default class AnalysisController {
    constructor(private analysisService: AnalysisService) {}

    fetchTacticalUsages = async (req: Request, res: Response) => {
        const tacticalUsages = await this.analysisService.fetchTacticalUsages();
        res.status(200).json(tacticalUsages);
    };

    fetchPreference = async (req: Request, res: Response) => {
        const preference = await this.analysisService.fetchPreference();
        res.status(200).json(preference);
    };

    fetchSynergy = async (req: Request, res: Response) => {
        const { mode } = req.query;
        const synergy = await this.analysisService.fetchSynergy(mode as SynergyMode);
        res.status(200).json(synergy);
    };

    fetchCharacterClusters = async (req: Request, res: Response) => {
        const characterClusters = await this.analysisService.fetchCharacterClusters();
        res.status(200).json(characterClusters);
    };
}
