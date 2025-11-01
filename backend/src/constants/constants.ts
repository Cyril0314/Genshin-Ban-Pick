// backend/src/constants/constants.ts

import { ITeam, createAetherTeam, createLumineTeam } from "../types/ITeam.ts"

export const totalRounds = 2
export const numberOfUtility = 6
export const numberOfBan = 8
export const numberOfPick = 32

export const teams: ITeam[] = [createAetherTeam(), createLumineTeam()]