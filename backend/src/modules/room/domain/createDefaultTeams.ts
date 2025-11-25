// backend/src/modules/room/domain/createDefaultTeams.ts

import { ITeam } from "../../../types/ITeam.ts";

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