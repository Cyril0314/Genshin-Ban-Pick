// backend/src/modules/room/domain/createDefaultTeams.ts

import type { ITeam } from '@shared/contracts/team/ITeam';

export function createDefaultTeams() {
    return [createAetherTeam(), createLumineTeam()];
}

function createAetherTeam(): ITeam {
    return {
        slot: 0,
        name: 'Team Aether'
    }
}

function createLumineTeam(): ITeam {
    return {
        slot: 1,
        name: 'Team Lumine'
    }
}