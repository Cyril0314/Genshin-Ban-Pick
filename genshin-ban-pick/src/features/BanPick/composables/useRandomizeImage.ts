// src/features/BanPick/composables/useRandomizeImage.vue

import type { IBanPickStep } from "@/types/IBanPickStep";
import { getZoneKey, ZoneType, type IZoneImageEntry } from "@/types/IZone";

/**
 * 處理 Utility 隨機功能，利用通用的 handleActinRandom
 */
export function handleUtilityRandom({
  roomSetting,
  filteredImageIds,
  boardImageMap,
  handleBoardImageDrop,
}: {
  roomSetting: any
  filteredImageIds: string[]
  boardImageMap: Record<string, IZoneImageEntry>
  handleBoardImageDrop: ({ zoneImageEntry, zoneKey }: { zoneImageEntry: IZoneImageEntry; zoneKey: string }) => void
}) {
  const utilityZones = Array.from(
    { length: roomSetting.numberOfUtility },
    (_, i) => {  return { id: i + 1, zoneType: ZoneType.UTILITY } },
  )
  const emptyZone = utilityZones.find((zone) => !boardImageMap[getZoneKey(zone)])
  if (!emptyZone) return

  const randomId = getRandomId(filteredImageIds, boardImageMap)
  if (!randomId) return
  const zoneKey = getZoneKey(emptyZone)
  const zoneImageEntry = { zone: emptyZone, imgId: randomId }
  handleBoardImageDrop({ zoneImageEntry, zoneKey })
}

/**
 * 處理 Ban 隨機功能，利用通用的 handleActinRandom
 */
export function handleBanRandom({
  roomSetting,
  filteredImageIds,
  boardImageMap,
  handleBoardImageDrop,
}: {
  roomSetting: any
  filteredImageIds: string[]
  boardImageMap: Record<string, IZoneImageEntry>
  handleBoardImageDrop: ({ zoneImageEntry, zoneKey }: { zoneImageEntry: IZoneImageEntry; zoneKey: string }) => void
}) {
  handleActionRandom({ roomSetting, filteredImageIds, boardImageMap, handleBoardImageDrop, action: 'ban' })
}

/**
 * 處理 Pick 隨機功能，利用通用的 handleActionRandom
 */
export function handlePickRandom({
  roomSetting,
  filteredImageIds,
  boardImageMap,
  handleBoardImageDrop,
}: {
  roomSetting: any
  filteredImageIds: string[]
  boardImageMap: Record<string, IZoneImageEntry>
  handleBoardImageDrop: ({ zoneImageEntry, zoneKey }: { zoneImageEntry: IZoneImageEntry; zoneKey: string }) => void
}) {
  handleActionRandom({ roomSetting, filteredImageIds, boardImageMap, handleBoardImageDrop, action: 'pick' })
}

function handleActionRandom({
  roomSetting,
  filteredImageIds,
  boardImageMap,
  handleBoardImageDrop,
  action,
}: {
  roomSetting: any
  filteredImageIds: string[]
  boardImageMap: Record<string, IZoneImageEntry>
  handleBoardImageDrop: ({ zoneImageEntry, zoneKey }: { zoneImageEntry: IZoneImageEntry; zoneKey: string }) => void
  action: 'ban' | 'pick'
}) {
  const step = roomSetting.banPickSteps.find( 
    (step: IBanPickStep) => step.zone.zoneType === action && !boardImageMap[getZoneKey(step.zone)],
  )
  if (!step) return

  const randomId = getRandomId(filteredImageIds, boardImageMap)
  if (!randomId) return
  const zoneKey = getZoneKey(step.zone)
  const zoneImageEntry = { zone: step.zone, imgId: randomId }
  handleBoardImageDrop({ zoneImageEntry, zoneKey })
}

function getRandomId(filteredImageIds: string[], boardImageMap: Record<string, IZoneImageEntry>): string | null {
  const usedImageIds = [...new Set(Object.values(boardImageMap).map(entry => entry.imgId))]
  const availableIds = filteredImageIds.filter((id) => !usedImageIds.includes(id))
  if (availableIds.length === 0) {
    console.warn('[getRandomId] 沒有可選的角色（都用完了）')
    return null
  }
  return availableIds[Math.floor(Math.random() * availableIds.length)]
}
