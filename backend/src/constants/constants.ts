// backend/src/constants/constants.ts

import { ITeam, createAetherTeam, createLumineTeam } from "../types/ITeam.ts"

export const numberOfUtility = 8
export const numberOfBan = 16
export const numberOfPick = 32

export const maxNumberOfUtilityPerColumn = 4
export const maxNumberOfBanPerRow = 8
export const maxNumberOfPickPerColumn = 8

export const totalRounds = 2
export const teams: ITeam[] = [createAetherTeam(), createLumineTeam()]