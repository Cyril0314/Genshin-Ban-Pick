// backend/src/modules/analysis/controller/analysis.controller.ts

import { Request, Response } from 'express';
import AnalysisService from '../application/analysis.service';

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { MatchTeamMemberUniqueIdentityKey } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export default class AnalysisController {
    constructor(private analysisService: AnalysisService) {}

    fetchOverview = async (req: Request, res: Response) => {
        const overview = await this.analysisService.fetchOverview();
        res.status(200).json(overview);
    };

    fetchCharacterUsageSummary = async (req: Request, res: Response) => {
        const tacticalUsages = await this.analysisService.fetchCharacterUsageSummary();
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
        const identityKey = this.parseIdentityKey(req.query);
        const style = await this.analysisService.fetchPlayerStyleProfile(identityKey);
        res.status(200).json(style);
    };

    fetchCharacterAttributeDistributions = async (req: Request, res: Response) => {
        const scope = this.parseScope(req.query)
        const distributions = await this.analysisService.fetchCharacterAttributeDistributions(scope);
        res.status(200).json(distributions);
    };

    parseScope(query: any): { type: 'Player'; identityKey: MatchTeamMemberUniqueIdentityKey } | { type: 'Global' } | null {
        const { scope, type, id, name } = query;
        if (scope === 'global') {
            return { type: 'Global' }
        }

        if (scope === 'player') {
            const identityKey = this.parseIdentityKey({ type, id, name })
            if (identityKey === null) {
                return null;
            }
            return { type: 'Player', identityKey}
        }

        return null
    }

    parseIdentityKey(query: any): MatchTeamMemberUniqueIdentityKey | null {
        const { type, id, name } = query;

        if (type === 'name') {
            return { type: 'Name', name };
        }

        if (type === 'member' || type === 'guest') {
            const numericId = Number(id);

            if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
                console.error(`Invalid ID format for type ${type}: ${id}`);
                return null;
            }

            return {
                type: type === 'member' ? 'Member' : 'Guest',
                id: numericId,
            };
        }

        console.error(`Unknown identity type: ${type}`);
        return null;
    }
}
