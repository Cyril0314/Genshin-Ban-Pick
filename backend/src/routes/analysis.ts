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
        '/analysis/meta',
        asyncHandler(async (req, res) => {
            const meta = await analysisService.getMeta();
            res.status(200).json(meta);
        }),
    );

    router.get(
        '/analysis/ban-pick-utility-stats',
        asyncHandler(async (req, res) => {
            const stats = await analysisService.getBanPickUtilityStats();
            res.status(200).json(stats);
        }),
    );


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
            const synergy = await analysisService.getSynergy();
            res.status(200).json(synergy);
        }),
    );

    router.get(
        '/analysis/archetypes',
        asyncHandler(async (req, res) => {
            const archetypes = await analysisService.getArchetypes();
            res.status(200).json(archetypes);
        }),
    );

    router.get(
        '/analysis/archetypeMap',
        asyncHandler(async (req, res) => {
            const archetypeMap = await analysisService.getArchetypeMap();
            res.status(200).json(archetypeMap);
        }),
    );

    return router;
}
