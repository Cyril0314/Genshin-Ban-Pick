// backend/src/factories/roomSettingFactory.ts

import { numberOfUtility, numberOfBan, numberOfPick, totalRounds, teams } from "../constants/constants.js";
import { generateBanPickSteps } from "../utils/banPickSteps.js";

export function createRoomSetting() {
    const banPickSteps = generateBanPickSteps(numberOfBan, numberOfPick, teams, totalRounds);

    return {
        numberOfUtility,
        numberOfBan,
        numberOfPick,
        totalRounds,
        teams,
        banPickSteps,
    };
}