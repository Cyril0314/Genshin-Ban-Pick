// src/types/ZoneType.ts

export interface IZone {
    id: number;
    zoneType: ZoneType;
}

export enum ZoneType {
    BAN = 'ban',
    PICK = 'pick',
    UTILITY = 'utility',
}

export interface IZoneImageEntry {
    zone: IZone;
    imgId: string;
}

export type ZoneKey = `${ZoneType}-${number}`

export function getZoneKey(zone: IZone): ZoneKey {
  return `${zone.zoneType}-${zone.id}` as ZoneKey
}
