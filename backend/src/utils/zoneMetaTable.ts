// backend/src/zoneMetaTable.ts

import { IZone, ZoneType } from '../types/IZone.ts';

export function createZoneMetaTable({
    numberOfUtility,
    numberOfBan,
    numberOfPick,
}: {
    numberOfUtility: number;
    numberOfBan: number;
    numberOfPick: number;
}) {
    let id = 0;

    function createZones(count: number, type: ZoneType): IZone[] {
        return Array.from({ length: count }, (_, order) => ({
            id: id++,
            type,
            order,
        }));
    }

    const utilityZones = createZones(numberOfUtility, ZoneType.Utility);
    const banZones = createZones(numberOfBan, ZoneType.Ban);
    const pickZones = createZones(numberOfPick, ZoneType.Pick);

    const zones = [...utilityZones, ...banZones, ...pickZones];

    return Object.fromEntries(zones.map(zone => [zone.id, zone]));
}