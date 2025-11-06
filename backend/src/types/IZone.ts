// backend/src/types/IZone.ts

export interface IZone {
    id: number;
    type: ZoneType;
    order: number;
}

export enum ZoneType {
    Ban = 'Ban',
    Pick = 'Pick',
    Utility = 'Utility',
}
