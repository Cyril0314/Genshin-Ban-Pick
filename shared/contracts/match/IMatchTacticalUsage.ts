import type { ICharacter } from "../character/ICharacter";

export interface IMatchTacticalUsage {
    id: number;
    modelVersion: number;
    setupNumber: number;

    teamMemberId: number;
    characterKey: string;

    character: ICharacter | null;
}