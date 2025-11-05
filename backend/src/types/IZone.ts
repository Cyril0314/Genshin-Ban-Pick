// backend/src/types/IZone.ts

export interface IZone {
    id: number;
    type: ZoneType;
    order: number;
}

export enum ZoneType {
    BAN = 'ban',
    PICK = 'pick',
    UTILITY = 'utility',
}
