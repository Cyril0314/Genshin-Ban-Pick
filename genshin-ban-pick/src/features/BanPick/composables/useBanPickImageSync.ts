// src/features/BanPick/composables//useBanPickImageSync.vue

import type { Ref } from 'vue'
import { ref, watch, readonly, computed, onMounted, onUnmounted } from 'vue'
import { useSocketStore } from '@/network/socket'
import { useBanPickStep } from './useBanPickStep'
import { useTacticalBoardSync } from '@/features/Tactical/composables/useTacticalBoardSync'
import type { RoomSetting } from '@/types/RoomSetting'
import type { Socket } from 'socket.io-client'

type ImageMap = Record<string, string>

export function useBanPickImageSync(roomSettingRef: Ref<RoomSetting | null>) {
  const imageMap = ref<ImageMap>({})
  const usedIds = computed(() => [...new Set(Object.values(imageMap.value))])
  const socket = useSocketStore().getSocket()
  const { isCurrentStepZone, advanceStep, resetStep } = useBanPickStep()
  let bufferedState: Record<string, string> | null = null

  watch(roomSettingRef, (newVal) => {
    if (newVal && bufferedState) {
      syncImageMapFromServer(bufferedState)
    }
  })

  onMounted(() => {
    socket.on('image.state.sync', syncImageMapFromServer)
    socket.on('image.drop.broadcast', handleImageDropBroadcast)
    socket.on('image.restore.broadcast', handleImageRestoreBroadcast)
    socket.on('image.reset.broadcast', handleImageResetBroadcast)
  })

  onUnmounted(() => {
    socket.off('image.state.sync', syncImageMapFromServer)
    socket.off('image.drop.broadcast', handleImageDropBroadcast)
    socket.off('image.restore.broadcast', handleImageRestoreBroadcast)
    socket.off('image.reset.broadcast', handleImageResetBroadcast)
  })

  function handleImageDropped({ imgId, zoneId }: { imgId: string; zoneId: string }) {
    console.log(
      `useBanPickImageSync handleImageDropped current image map imgId ${imgId} zoneId ${zoneId}`,
    )
    const previousZoneId = findZoneIdByImage(imgId)
    const displacedImgId = imageMap.value[zoneId]

    if (displacedImgId && previousZoneId && previousZoneId !== zoneId) {
      swapImages(imgId, displacedImgId, zoneId, previousZoneId)
      socket.emit('image.restore.request', {
        zoneId: previousZoneId,
        senderId: socket.id,
      })
      socket.emit('image.restore.request', {
        zoneId,
        senderId: socket.id,
      })
      socket.emit('image.drop.request', {
        imgId,
        zoneId,
        senderId: socket.id,
      })
      socket.emit('image.drop.request', {
        imgId: displacedImgId,
        zoneId: previousZoneId,
        senderId: socket.id,
      })
    } else {
      if (previousZoneId) {
        removeImage(imgId, previousZoneId)
        socket.emit('image.restore.request', {
          zoneId: previousZoneId,
          senderId: socket.id,
        })
      } else if (displacedImgId) {
        removeImage(displacedImgId, zoneId)
        socket.emit('image.restore.request', {
          zoneId,
          senderId: socket.id,
        })
      }
      placeImage(imgId, zoneId)

      socket.emit('image.drop.request', {
        imgId,
        zoneId,
        senderId: socket.id,
      })

      if (isCurrentStepZone(zoneId)) {
        advanceStep()
      }
    }
  }

  function handleImageRestore({ imgId }: { imgId: string }) {
    console.log(`useBanPickImageSync handleImageRestore current image map imgId ${imgId}`)
    const zoneId = findZoneIdByImage(imgId)
    if (!zoneId) return
    removeImage(imgId, zoneId)
    socket.emit('image.restore.request', {
      zoneId,
      senderId: socket.id,
    })
    console.log('[Client] Sent image.restore.request:', zoneId)
  }

  function handleImageReset() {
    imageMap.value = {}
    clearTacticalBoardIfNeeded()

    socket.emit('image.reset.request', {
      senderId: socket.id,
    })
    console.log('[Client] Sent image.reset.request:')
    resetStep()
  }

  function handleBanPickRecord() {
    const grouped: Record<'ban' | 'pick' | 'utility' | 'other', Record<string, string>> = {
      ban: {},
      pick: {},
      utility: {},
      other: {},
    }

    for (const [zoneId, charId] of Object.entries(imageMap.value)) {
      if (zoneId.startsWith('zone-ban')) grouped.ban[zoneId] = charId
      else if (zoneId.startsWith('zone-pick')) grouped.pick[zoneId] = charId
      else if (zoneId.startsWith('zone-utility')) grouped.utility[zoneId] = charId
      else grouped.other[zoneId] = charId
    }

    console.log('Grouped BanPick Data:', grouped)
  }

  function syncImageMapFromServer(state: Record<string, string>) {
    if (!roomSettingRef.value) {
      bufferedState = state
      console.log(`syncImageMapFromServer roomSettingRef.value is nil`)
      return
    }
    console.log(`syncImageMapFromServer start`)
    imageMap.value = { ...state }
    for (const [zoneId, imgId] of Object.entries(imageMap.value)) {
      cloneToTacticalPoolIfNeeded(imgId, zoneId)
    }
    bufferedState = null
  }

  function handleImageDropBroadcast({
    imgId,
    zoneId,
    senderId,
  }: {
    imgId: string
    zoneId: string
    senderId: string
  }) {
    if (socket.id === senderId) return
    console.log(`[Client] image dropped received from other user imgId ${imgId} zoneId ${zoneId}`)
    placeImage(imgId, zoneId)
  }

  function handleImageRestoreBroadcast({ zoneId, senderId }: { zoneId: string; senderId: string }) {
    if (socket.id === senderId) return
    const imgId = imageMap.value[zoneId]
    removeImage(imgId, zoneId)
  }

  function handleImageResetBroadcast({ senderId }: { senderId: string }) {
    if (socket.id === senderId) return
    console.log(`[Client] image reset received from other user`)

    imageMap.value = {}
    clearTacticalBoardIfNeeded()
  }

  function swapImages(
    imgId: string,
    displacedImgId: string,
    zoneId: string,
    previousZoneId: string,
  ) {
    removeImage(imgId, previousZoneId)
    removeImage(displacedImgId, zoneId)
    placeImage(imgId, zoneId)
    placeImage(displacedImgId, previousZoneId)
  }

  function placeImage(imgId: string, zoneId: string) {
    imageMap.value[zoneId] = imgId
    cloneToTacticalPoolIfNeeded(imgId, zoneId)
  }

  function removeImage(imgId: string, zoneId: string) {
    delete imageMap.value[zoneId]
    removeFromTacticalBoardIfNeeded(imgId, zoneId)
  }

  function findZoneIdByImage(imgId: string): string | undefined {
    return Object.entries(imageMap.value).find(([, id]) => id === imgId)?.[0]
  }

  // --- Tactical Board ---

  function getTeamFromZone(zoneId: string): 'aether' | 'lumine' | null {
    const banPickFlow = roomSettingRef.value?.banPickFlow
    const match = banPickFlow?.find((f) => f.zoneId === zoneId && f.action === 'pick')
    console.log(`player ${match?.player}`)
    return match?.player === 'Team Aether'
      ? 'aether'
      : match?.player === 'Team Lumine'
        ? 'lumine'
        : null
  }

  function cloneToTacticalPoolIfNeeded(imgId: string, zoneId: string) {
    if (zoneId.includes('pick')) {
      const team = getTeamFromZone(zoneId)
      console.log(`team ${team}`)
      if (team) useTacticalBoardSync(team).addToPool(imgId)
    } else if (zoneId.includes('utility')) {
      useTacticalBoardSync('aether').addToPool(imgId)
      useTacticalBoardSync('lumine').addToPool(imgId)
    }
  }

  function removeFromTacticalBoardIfNeeded(imgId: string, zoneId: string) {
    if (zoneId.includes('pick')) {
      const team = getTeamFromZone(zoneId)
      if (team) useTacticalBoardSync(team).removeFromBoard(imgId)
    } else {
      useTacticalBoardSync('aether').removeFromBoard(imgId)
      useTacticalBoardSync('lumine').removeFromBoard(imgId)
    }
  }

  function clearTacticalBoardIfNeeded() {
    useTacticalBoardSync('aether').clearBoard()
    useTacticalBoardSync('lumine').clearBoard()
  }

  return {
    imageMap: readonly(imageMap),
    usedIds,
    handleImageDropped,
    handleImageRestore,
    handleImageReset,
    handleBanPickRecord,
  }
}
