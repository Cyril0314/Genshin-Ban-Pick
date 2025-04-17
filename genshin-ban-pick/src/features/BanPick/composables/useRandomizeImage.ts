// src/features/BanPick/composables/useRandomizeImage.vue

export function handleUtilityRandom({
  roomSetting,
  filteredIds,
  imageMap,
  handleImageDropped,
}: {
  roomSetting: any
  filteredIds: string[]
  imageMap: Record<string, string>
  handleImageDropped: ({ imgId, zoneId }: { imgId: string; zoneId: string }) => void
}) {
  const utilityZoneIds = Array.from(
    { length: roomSetting.numberOfUtility },
    (_, i) => `zone-utility-${i + 1}`,
  )
  const emptyZoneId = utilityZoneIds.find((id) => !imageMap[id])
  if (!emptyZoneId) return

  const randomId = getRandomId(filteredIds, imageMap)
  if (!randomId) return

  handleImageDropped({ imgId: randomId, zoneId: emptyZoneId })
}

// const remainingZones = utilityZoneIds.filter((id) => !imageMap[id])
// const shuffled = [...filteredIds].sort(() => 0.5 - Math.random())

// remainingZones.forEach((zoneId, i) => {
//   const imgId = shuffled[i]
//   if (imgId) {
//     handleImageDropped({ imgId, zoneId })
//   }
// })
/**
 * 處理 Ban 隨機功能，利用通用的 handleActionRandom
 */
export function handleBanRandom({
  roomSetting,
  filteredIds,
  imageMap,
  handleImageDropped,
}: {
  roomSetting: any
  filteredIds: string[]
  imageMap: Record<string, string>
  handleImageDropped: ({ imgId, zoneId }: { imgId: string; zoneId: string }) => void
}) {
  handleActionRandom({ roomSetting, filteredIds, imageMap, handleImageDropped, action: 'ban' })
}

/**
 * 處理 Pick 隨機功能，利用通用的 handleActionRandom
 */
export function handlePickRandom({
  roomSetting,
  filteredIds,
  imageMap,
  handleImageDropped,
}: {
  roomSetting: any
  filteredIds: string[]
  imageMap: Record<string, string>
  handleImageDropped: ({ imgId, zoneId }: { imgId: string; zoneId: string }) => void
}) {
  handleActionRandom({ roomSetting, filteredIds, imageMap, handleImageDropped, action: 'pick' })
}

function handleActionRandom({
  roomSetting,
  filteredIds,
  imageMap,
  handleImageDropped,
  action,
}: {
  roomSetting: any
  filteredIds: string[]
  imageMap: Record<string, string>
  handleImageDropped: ({ imgId, zoneId }: { imgId: string; zoneId: string }) => void
  action: 'ban' | 'pick'
}) {
  const step = roomSetting.banPickFlow.find(
    (step: any) => step.action === action && !imageMap[step.zoneId],
  )
  if (!step) return

  const randomId = getRandomId(filteredIds, imageMap)
  if (!randomId) return

  handleImageDropped({ imgId: randomId, zoneId: step.zoneId })
}

function getRandomId(filteredIds: string[], imageMap: Record<string, string>): string | null {
  const usedIds = Object.values(imageMap)
  const availableIds = filteredIds.filter((id) => !usedIds.includes(id))
  if (availableIds.length === 0) {
    console.warn('[getRandomId] 沒有可選的角色（都用完了）')
    return null
  }
  return availableIds[Math.floor(Math.random() * availableIds.length)]
}
