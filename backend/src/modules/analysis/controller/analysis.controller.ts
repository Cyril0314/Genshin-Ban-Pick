// backend/src/modules/analysis/controller/analysis.controller.ts

import { Request, Response } from 'express';
import AnalysisService from '../application/analysis.service';

import type { SynergyMode } from '@shared/contracts/analysis/value-types';
import type { MatchTeamMemberUniqueIdentity } from '@shared/contracts/match/MatchTeamMemberUniqueIdentity';

export default class AnalysisController {
    constructor(private analysisService: AnalysisService) {}

    fetchCharacterTacticalUsages = async (req: Request, res: Response) => {
        const tacticalUsages = await this.analysisService.fetchCharacterTacticalUsages();
        res.status(200).json(tacticalUsages);
    };

    fetchCharacterPickPriority = async (req: Request, res: Response) => {
        const result = await this.analysisService.fetchCharacterPickPriority();
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

    fetchCharacterClusters = async (req: Request, res: Response) => {
        const characterClusters = await this.analysisService.fetchCharacterClusters();
        res.status(200).json(characterClusters);
    };

    fetchPlayerPreference = async (req: Request, res: Response) => {
        const preference = await this.analysisService.fetchPlayerPreference();
        res.status(200).json(preference);
    };

    fetchPlayerStyleProfile = async (req: Request, res: Response) => {
        const { identity } = req.query;
        const style = await this.analysisService.fetchPlayerStyleProfile(
            this.convertIdentity(identity as { type: string; id?: string; name: string }),
        );
        res.status(200).json(style);
    };

    convertIdentity(input: { type: string; id?: string; name: string }): MatchTeamMemberUniqueIdentity | null {
        const { type, id, name } = input;

        if (type === 'Name') {
            return { type: 'Name', name };
        }

        if (type === 'Member' || type === 'Guest') {
            const numericId = Number(id);

            if (isNaN(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
                console.error(`Invalid ID format for type ${type}: ${id}`);
                return null;
            }

            return {
                type: type as 'Member' | 'Guest',
                id: numericId,
                name: name,
            };
        }

        console.error(`Unknown identity type: ${type}`);
        return null;
    }
}
