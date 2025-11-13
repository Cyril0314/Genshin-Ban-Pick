// backend/src/routes/analysis.ts

import express, { Request, Response } from 'express';

import AnalysisService from '../services/analysis/AnalysisService.ts';
import { asyncHandler } from '../utils/asyncHandler.ts';

export default function analysisRoutes(analysisService: AnalysisService) {
    const router = express.Router();

    router.get(
        '/analysis/tactical-usages',
        asyncHandler(async (req, res) => {
            const tacticalUsages = await analysisService.getTacticalUsages();
            res.status(200).json(tacticalUsages);
        }),
    )

    router.get(
        '/analysis/preference',
        asyncHandler(async (req, res) => {
            const preference = await analysisService.getPreference();
            res.status(200).json(preference);
        }),
    );

    router.get(
        '/analysis/synergy',
        asyncHandler(async (req, res) => {
            const { mode, } = req.query;
            const synergy = await analysisService.getSynergy(mode as 'team' | 'match' | 'setup');
            res.status(200).json(synergy);
        }),
    );

    router.get(
        '/analysis/character-clusters',
        asyncHandler(async (req, res) => {
            const characterClusters = await analysisService.getCharacterClusters();
            res.status(200).json(characterClusters);
        }),
    );

    return router;
}
