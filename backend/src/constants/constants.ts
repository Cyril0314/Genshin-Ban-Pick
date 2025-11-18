// backend/src/constants/constants.ts

import { ITeam, createAetherTeam, createLumineTeam } from "../types/ITeam.ts"

export const flowVersion = 1
export const totalRounds = 2
export const numberOfUtility = 3
export const numberOfBan = 4
export const numberOfPick = 32

export const teams: ITeam[] = [createAetherTeam(), createLumineTeam()]

export const tacticalVersion = 1
export const numberOfTeamSetup = 4
export const numberOfSetupCharacter = 4
