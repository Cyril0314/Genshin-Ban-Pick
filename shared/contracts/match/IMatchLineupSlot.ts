import type { ICharacter } from "../character/ICharacter";

export interface IMatchLineupSlot {
    id: number;
    modelVersion: number;
    setupNumber: number;

    teamMemberId: number;
    characterKey: string;

    character: ICharacter;
}
