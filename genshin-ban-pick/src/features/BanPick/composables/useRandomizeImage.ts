// src/features/BanPick/composables/useRandomizeImage.vue

/**
 * 處理 Utility 隨機功能，利用通用的 handleActinRandom
 */
export function handleUtilityRandom({
  roomSetting,
  filteredImageIds,
  imageMap,
  handleImageDropped,
}: {
  roomSetting: any
  filteredImageIds: string[]
  imageMap: Record<string, string>
  handleImageDropped: ({ imgId, zoneId }: { imgId: string; zoneId: string }) => void
}) {
  const utilityZoneIds = Array.from(
    { length: roomSetting.numberOfUtility },
    (_, i) => `zone-utility-${i + 1}`,
  )
  const emptyZoneId = utilityZoneIds.find((id) => !imageMap[id])
  if (!emptyZoneId) return

  const randomId = getRandomId(filteredImageIds, imageMap)
  if (!randomId) return

  handleImageDropped({ imgId: randomId, zoneId: emptyZoneId })
}

/**
 * 處理 Ban 隨機功能，利用通用的 handleActinRandom
 */
export function handleBanRandom({
  roomSetting,
  filteredImageIds,
  imageMap,
  handleImageDropped,
}: {
  roomSetting: any
  filteredImageIds: string[]
  imageMap: Record<string, string>
  handleImageDropped: ({ imgId, zoneId }: { imgId: string; zoneId: string }) => void
}) {
  handleActionRandom({ roomSetting, filteredImageIds, imageMap, handleImageDropped, action: 'ban' })
}

/**
 * 處理 Pick 隨機功能，利用通用的 handleActionRandom
 */
export function handlePickRandom({
  roomSetting,
  filteredImageIds,
  imageMap,
  handleImageDropped,
}: {
  roomSetting: any
  filteredImageIds: string[]
  imageMap: Record<string, string>
  handleImageDropped: ({ imgId, zoneId }: { imgId: string; zoneId: string }) => void
}) {
  handleActionRandom({ roomSetting, filteredImageIds, imageMap, handleImageDropped, action: 'pick' })
}

function handleActionRandom({
  roomSetting,
  filteredImageIds,
  imageMap,
  handleImageDropped,
  action,
}: {
  roomSetting: any
  filteredImageIds: string[]
  imageMap: Record<string, string>
  handleImageDropped: ({ imgId, zoneId }: { imgId: string; zoneId: string }) => void
  action: 'ban' | 'pick'
}) {
  const step = roomSetting.banPickSteps.find(
    (step: any) => step.action === action && !imageMap[step.zoneId],
  )
  if (!step) return

  const randomId = getRandomId(filteredImageIds, imageMap)
  if (!randomId) return

  handleImageDropped({ imgId: randomId, zoneId: step.zoneId })
}

function getRandomId(filteredImageIds: string[], imageMap: Record<string, string>): string | null {
  const usedImageIds = Object.values(imageMap)
  const availableIds = filteredImageIds.filter((id) => !usedImageIds.includes(id))
  if (availableIds.length === 0) {
    console.warn('[getRandomId] 沒有可選的角色（都用完了）')
    return null
  }
  return availableIds[Math.floor(Math.random() * availableIds.length)]
}
