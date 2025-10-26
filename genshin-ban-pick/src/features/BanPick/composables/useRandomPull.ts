// src/features/BanPick/composables/useRandomizeImage.vue

import type { IBanPickStep } from "@/types/IBanPickStep";
import type { IRoomSetting } from "@/types/IRoomSetting";
import { ZoneType } from "@/types/IZone";

import type { IZone } from "@/types/IZone";

export function useRandomPull() {
  function randomPull(zoneType: ZoneType, roomSetting: IRoomSetting, boardImageMap: Record<number, string>, filteredImageIds: string[]): { imgId: string; zoneId: number } | null {
    let zoneId: number | null
    switch (zoneType) {
      case ZoneType.UTILITY:
        zoneId = findNextUtilityZoneId(roomSetting.zoneMetaTable, boardImageMap)
        break;

      case ZoneType.PICK:
        zoneId = findNextBanPickStepZoneId('pick', roomSetting.banPickSteps, roomSetting.zoneMetaTable, boardImageMap)
        break;

      case ZoneType.BAN:
        zoneId = findNextBanPickStepZoneId('ban', roomSetting.banPickSteps, roomSetting.zoneMetaTable, boardImageMap)
        break;
    }
    const randomImgId = getRandomImgId(filteredImageIds, boardImageMap)
    if (zoneId === null || randomImgId === null) return null
    console.debug(`[RANDOM PULL] Get random image ${randomImgId} and find drop zoneId ${zoneId}`)
    return { imgId: randomImgId, zoneId }
  }

  function findNextUtilityZoneId(zoneMetaTable: Record<number, IZone>, boardImageMap: Record<number, string>): number | null {
    const utilityZones = Object.values(zoneMetaTable).filter(zone => zone.type == ZoneType.UTILITY).sort((a, b) => a.order - b.order)
    const emptyZone = utilityZones.find((zone) => !boardImageMap[zone.id])
    if (!emptyZone) {
      console.warn('[RANDOM PULL] Cannot find any utility zone')
      return null
    }
    return emptyZone.id
  }

  function findNextBanPickStepZoneId(action: 'ban' | 'pick', banPickSteps: IBanPickStep[], zoneMetaTable: Record<number, IZone>, boardImageMap: Record<number, string>): number | null {
    const step = banPickSteps.find(
      (step: IBanPickStep) => {
        const zone = zoneMetaTable[step.zoneId]
        return zone.type === action && !boardImageMap[step.zoneId]
      }
    )
    if (!step) {
      console.warn(`[RANDOM PULL] Cannot find next ${action} step `)
      return null
    }
    return step.zoneId
  }

  function getRandomImgId(filteredImageIds: string[], boardImageMap: Record<number, string>): string | null {
    const usedImageIds = [...new Set(Object.values(boardImageMap).map(imgId => imgId))]
    const availableIds = filteredImageIds.filter((id) => !usedImageIds.includes(id))
    if (availableIds.length === 0) {
      console.warn('[RANDOM PULL] Character is not enough')
      return null
    }
    return availableIds[Math.floor(Math.random() * availableIds.length)]
  }

  return { randomPull }
}