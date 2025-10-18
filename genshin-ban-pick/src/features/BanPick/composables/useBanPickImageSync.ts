// src/features/BanPick/composables//useBanPickImageSync.vue

import { ref, watch, readonly, computed, onMounted, onUnmounted } from 'vue'

import { useBanPickStep } from './useBanPickStep'

import type { IRoomSetting } from '@/types/IRoomSetting'
import type { ITeam } from '@/types/ITeam'
import type { Ref } from 'vue'

import { useTacticalBoardSync } from '@/features/Tactical/composables/useTacticalBoardSync'
import { useSocketStore } from '@/network/socket'

enum SocketEvent {
    BOARD_IMAGE_DROP_REQUEST = 'board.image.drop.request',
    BOARD_IMAGE_DROP_BROADCAST = 'board.image.drop.broadcast',

    BOARD_IMAGE_RESTORE_REQUEST = 'board.image.restore.request',
    BOARD_IMAGE_RESTORE_BROADCAST = 'board.image.restore.broadcast',

    BOARD_IMAGES_RESET_REQUEST = 'board.images.reset.request',
    BOARD_IMAGES_RESET_BROADCAST = 'board.images.reset.broadcast',

    BOARD_IMAGES_STATE_SYNC = 'board.images.state.sync',
}

type ImageMap = Record<string, string>;

export function useBanPickImageSync(roomSettingRef: Ref<IRoomSetting | null>) {
  const imageMap = ref<ImageMap>({})
  const usedImageIds = computed(() => [...new Set(Object.values(imageMap.value))])
  const socket = useSocketStore().getSocket()
  const { isCurrentStepZone, advanceStep, resetStep } = useBanPickStep()
  let bufferedState: Record<string, string> | null = null

  watch(roomSettingRef, (newVal) => {
    if (newVal && bufferedState) {
      syncImageMapFromServer(bufferedState)
    }
  })

  onMounted(() => {
    socket.on(`${SocketEvent.BOARD_IMAGES_STATE_SYNC}`, syncImageMapFromServer)
    socket.on(`${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`, handleImageDropBroadcast)
    socket.on(`${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`, handleImageRestoreBroadcast)
    socket.on(`${SocketEvent.BOARD_IMAGES_RESET_BROADCAST}`, handleImageResetBroadcast)
  })

  onUnmounted(() => {
    socket.off(`${SocketEvent.BOARD_IMAGES_STATE_SYNC}`, syncImageMapFromServer)
    socket.off(`${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`, handleImageDropBroadcast)
    socket.off(`${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`, handleImageRestoreBroadcast)
    socket.off(`${SocketEvent.BOARD_IMAGES_RESET_BROADCAST}`, handleImageResetBroadcast)
  })

  function handleImageDropped({ imgId, zoneId }: { imgId: string; zoneId: string }) {
    console.log(
      `useBanPickImageSync handleImageDropped current image map imgId ${imgId} zoneId ${zoneId}`,
    )
    const previousZoneId = findZoneIdByImage(imgId)
    const displacedImgId = imageMap.value[zoneId]

    if (displacedImgId && previousZoneId && previousZoneId !== zoneId) {
      swapImages(imgId, displacedImgId, zoneId, previousZoneId)
      socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, {
        zoneId: previousZoneId,
        senderId: socket.id,
      })
      socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, {
        zoneId,
        senderId: socket.id,
      })
      socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, {
        imgId,
        zoneId,
        senderId: socket.id,
      })
      socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, {
        imgId: displacedImgId,
        zoneId: previousZoneId,
        senderId: socket.id,
      })
    } else {
      if (previousZoneId) {
        removeImage(imgId, previousZoneId)
        socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, {
          zoneId: previousZoneId,
          senderId: socket.id,
        })
      } else if (displacedImgId) {
        removeImage(displacedImgId, zoneId)
        socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, {
          zoneId,
          senderId: socket.id,
        })
      }
      placeImage(imgId, zoneId)

      socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, {
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
    socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, {
      zoneId,
      senderId: socket.id,
    })
    console.log('[Client] Sent board.image.restore.request:', zoneId)
  }

  function handleImageReset() {
    imageMap.value = {}
    clearTacticalBoardIfNeeded()

    socket.emit(`${SocketEvent.BOARD_IMAGES_RESET_REQUEST}`, {
      senderId: socket.id,
    })
    console.log('[Client] Sent board.images.reset.request:')
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

  function getTeamFromZone(zoneId: string): ITeam | undefined {
    const banPickSteps = roomSettingRef.value?.banPickSteps
    const match = banPickSteps?.find((f) => f.zoneId === zoneId && f.action === 'pick')
    return match?.team
  }

  function cloneToTacticalPoolIfNeeded(imgId: string, zoneId: string) {
    if (zoneId.includes('pick')) {
      const team = getTeamFromZone(zoneId)
      if (team) useTacticalBoardSync(team.id).addToPool(imgId)
    } else if (zoneId.includes('utility')) {
      if (roomSettingRef.value?.teams) {
        for (const team of roomSettingRef.value.teams) {
          useTacticalBoardSync(team.id).addToPool(imgId)
        }
      }
    }
  }

  function removeFromTacticalBoardIfNeeded(imgId: string, zoneId: string) {
    if (zoneId.includes('pick')) {
      const team = getTeamFromZone(zoneId)
      if (team) useTacticalBoardSync(team.id).removeFromBoard(imgId)
    } else {
      if (roomSettingRef.value?.teams) {
        for (const team of roomSettingRef.value.teams) {
          useTacticalBoardSync(team.id).removeFromBoard(imgId)
        }
      }
    }
  }

  function clearTacticalBoardIfNeeded() {
    if (roomSettingRef.value?.teams) {
      for (const team of roomSettingRef.value.teams) {
        useTacticalBoardSync(team.id).clearBoard()
      }
    }
  }

  return {
    imageMap: readonly(imageMap),
    usedImageIds,
    handleImageDropped,
    handleImageRestore,
    handleImageReset,
    handleBanPickRecord,
  }
}
