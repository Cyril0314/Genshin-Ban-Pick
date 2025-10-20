// src/features/BanPick/composables/useRandomizeImage.vue

import type { IBanPickStep } from "@/types/IBanPickStep";
import type { IRoomSetting } from "@/types/IRoomSetting";
import { ZoneType } from "@/types/IZone";

/**
 * 處理 Utility 隨機功能，利用通用的 handleActinRandom
 */
export function handleUtilityRandom({
  roomSetting,
  filteredImageIds,
  boardImageMap,
  handleBoardImageDrop,
}: {
  roomSetting: IRoomSetting
  filteredImageIds: string[]
  boardImageMap: Record<number, string>
  handleBoardImageDrop: ({ imgId, zoneId }: { imgId: string; zoneId: number }) => void
}) {
  const utilityZones = roomSetting.zoneSchema.utilityZones
  const emptyZone = utilityZones.find((zone) => !boardImageMap[zone.id])
  if (!emptyZone) return

  const randomId = getRandomId(filteredImageIds, boardImageMap)
  if (!randomId) return
  handleBoardImageDrop({ imgId: randomId, zoneId: emptyZone.id })
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
  roomSetting: IRoomSetting
  filteredImageIds: string[]
  boardImageMap: Record<number, string>
  handleBoardImageDrop: ({ imgId, zoneId }: { imgId: string; zoneId: number }) => void
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
  roomSetting: IRoomSetting
  filteredImageIds: string[]
  boardImageMap: Record<number, string>
  handleBoardImageDrop: ({ imgId, zoneId }: { imgId: string; zoneId: number }) => void
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
  roomSetting: IRoomSetting
  filteredImageIds: string[]
  boardImageMap: Record<number, string>
  handleBoardImageDrop: ({ imgId, zoneId }: { imgId: string; zoneId: number }) => void
  action: 'ban' | 'pick'
}) {
  const step = roomSetting.banPickSteps.find(
    (step: IBanPickStep) => {
      const zone = roomSetting.zoneSchema.zoneMetaTable[step.zoneId]
      return zone.type === action && !boardImageMap[step.zoneId]
    }
  )
  if (!step) return

  const randomId = getRandomId(filteredImageIds, boardImageMap)
  if (!randomId) return
  handleBoardImageDrop({ imgId: randomId, zoneId: step.zoneId })
}

function getRandomId(filteredImageIds: string[], boardImageMap: Record<number, string>): string | null {
  const usedImageIds = [...new Set(Object.values(boardImageMap).map(imgId => imgId))]
  const availableIds = filteredImageIds.filter((id) => !usedImageIds.includes(id))
  if (availableIds.length === 0) {
    console.warn('[getRandomId] 沒有可選的角色（都用完了）')
    return null
  }
  return availableIds[Math.floor(Math.random() * availableIds.length)]
}
