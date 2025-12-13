// backend/src/modules/analysis/infra/projection/CharacterFeatureMatrixBuilder.ts

import { CharacterRole, Element, Region, Weapon } from '@shared/contracts/character/value-types';
import type { FeatureMatrix } from '@shared/contracts/analysis/FeatureMatrix';
import type { ICharacter } from '@shared/contracts/character/ICharacter';

const ELEMENTS = Object.values(Element).filter((e) => e !== Element.None);
const WEAPONS = Object.values(Weapon);
const REGIONS = Object.values(Region);
const CHARACTER_ROLES = Object.values(CharacterRole);

export default class CharacterFeatureMatrixBuilder {
    build(characters: ICharacter[]): FeatureMatrix<string, string> {
        const sortedCharacters = [...characters].sort((characterLfs, characterRhs) => characterLfs.key.localeCompare(characterRhs.key));
        const rowKeys = sortedCharacters.map(character => character.key);

        const colKeys: string[] = [];
        const data: number[][] = [];

        for (const element of ELEMENTS) colKeys.push(`element:${element}`);
        // for (const weapon of WEAPONS) colKeys.push(`weapon:${weapon}`);
        // for (const region of REGIONS) colKeys.push(`region:${region}`);
        for (const characterRole of CHARACTER_ROLES) colKeys.push(`characterRole:${characterRole}`);

        for (const character of sortedCharacters) {
            const elementVec = this.buildElementVector(character.element);
            // const weaponVec = this.buildWeaponVector(character.weapon);
            // const regionVec = this.buildRegionVector(character.region);
            const characterRoleVec = this.buildCharacterRoleVector(character.role);
            const featureVec = [
                ...elementVec, 
                ...characterRoleVec,
            ];
            data.push(featureVec);
        }

        return {
            rowKeys,
            colKeys,
            data,
        };
    }

    private buildElementVector(element: Element): number[] {
        return ELEMENTS.map((el) => (el === element ? 1 : 0));
    }

    private buildWeaponVector(weapon: Weapon): number[] {
        return WEAPONS.map((w) => (w === weapon ? 1 : 0));
    }

    private buildRegionVector(region: Region): number[] {
        return REGIONS.map((r) => (r === region ? 1 : 0));
    }

    private buildCharacterRoleVector(characterRole: CharacterRole): number[] {
        return CHARACTER_ROLES.map((cr) => (cr === characterRole ? 1 : 0));
    }
}
