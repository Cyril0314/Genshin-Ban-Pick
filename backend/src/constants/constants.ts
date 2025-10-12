// backend/src/constants/constants.ts

import { ITeam, createAetherTeam, createLumineTeam } from "../types/ITeam.ts"

export const numberOfUtility = 4
export const numberOfPick = 32
export const numberOfBan = 8
export const totalRounds = 2
export const teams: ITeam[] = [createAetherTeam(), createLumineTeam()]