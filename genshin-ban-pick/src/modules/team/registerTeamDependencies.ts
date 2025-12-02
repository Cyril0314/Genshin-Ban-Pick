// src/modules/team/registerTeamDependencies.ts

import { DIKeys } from '@/app/constants/diKeys';
import TeamUseCase from './application/TeamUseCase';

import type { App } from 'vue';
import type { useTeamInfoStore } from './store/teamInfoStore';

export function registerTeamDependencies(app: App,teamInfoStore: ReturnType<typeof useTeamInfoStore>) {
    const teamUseCase = new TeamUseCase(teamInfoStore);
    app.provide(DIKeys.TeamUseCase, teamUseCase);
}
