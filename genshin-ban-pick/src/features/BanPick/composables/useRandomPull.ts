// src/features/BanPick/composables/useRandomizeImage.vue

import type { IMatchStep } from "@/types/IMatchFlow";
import type { IRoomSetting } from "@/types/IRoomSetting";
import { ZoneType } from "@/types/IZone";

import type { IZone } from "@/types/IZone";

export function useRandomPull() {
  function randomPull(zoneType: ZoneType, roomSetting: IRoomSetting, boardImageMap: Record<number, string>, filteredCharacterKeys: string[]): { zoneId: number, imgId: string } | null {
    const zoneId = findNextMatchStepZoneId(zoneType, roomSetting.matchFlow.steps, roomSetting.zoneMetaTable, boardImageMap)
    const randomImgId = getRandomImgId(filteredCharacterKeys, boardImageMap)
    if (zoneId === null || randomImgId === null) return null
    console.debug(`[RANDOM PULL] Get random image ${randomImgId} and find drop zoneId ${zoneId}`)
    return { zoneId, imgId: randomImgId }
  }

  function findNextMatchStepZoneId(zoneType: ZoneType, matchSteps: IMatchStep[], zoneMetaTable: Record<number, IZone>, boardImageMap: Record<number, string>): number | null {
    const step = matchSteps.find(
      (step: IMatchStep) => {
        const zone = zoneMetaTable[step.zoneId]
        return zone.type === zoneType && !boardImageMap[step.zoneId]
      }
    )
    if (!step) {
      console.warn(`[RANDOM PULL] Cannot find next ${zoneType} step `)
      return null
    }
    return step.zoneId
  }

  function getRandomImgId(filteredCharacterKeys: string[], boardImageMap: Record<number, string>): string | null {
    const usedImageIds = [...new Set(Object.values(boardImageMap).map(imgId => imgId))]
    const availableIds = filteredCharacterKeys.filter((key) => !usedImageIds.includes(key))
    if (availableIds.length === 0) {
      console.warn('[RANDOM PULL] Character is not enough')
      return null
    }
    return availableIds[Math.floor(Math.random() * availableIds.length)]
  }

  return { randomPull }
}