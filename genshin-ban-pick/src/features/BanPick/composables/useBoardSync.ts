// src/features/BanPick/composables//useBoardSync.vue

import { readonly, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia';

import { useBanPickStep } from './useBanPickStep'
import type { ITeam } from '@/types/ITeam'

import { useTacticalBoardSync } from '@/features/Tactical/composables/useTacticalBoardSync'
import { useSocketStore } from '@/network/socket'
import { useBoardImageStore } from '@/stores/boardImageStore'
import { useTeamInfoStore } from '@/stores/teamInfoStore';

enum SocketEvent {
  BOARD_IMAGE_DROP_REQUEST = 'board.image.drop.request',
  BOARD_IMAGE_DROP_BROADCAST = 'board.image.drop.broadcast',

  BOARD_IMAGE_RESTORE_REQUEST = 'board.image.restore.request',
  BOARD_IMAGE_RESTORE_BROADCAST = 'board.image.restore.broadcast',

  BOARD_IMAGE_MAP_RESET_REQUEST = 'board.image_map.reset.request',
  BOARD_IMAGE_MAP_RESET_BROADCAST = 'board.image_map.reset.broadcast',

  BOARD_IMAGE_MAP_STATE_SYNC = 'board.image_map.state.sync',
}

export function useBoardSync() {
  const socket = useSocketStore().getSocket()
  const boardImageStore = useBoardImageStore()
  const { boardImageMap, usedImageIds, } = storeToRefs(boardImageStore)
  const { setBoardImageMap, placeBoardImage, removeBoardImage, resetBoardImageMap, findZoneIdByImageId } = boardImageStore

  const { banPickSteps, isCurrentStepZone, advanceStep, resetStep } = useBanPickStep()

  const teamInfoStore = useTeamInfoStore()
  const { currentTeams } = storeToRefs(teamInfoStore)

  onMounted(() => {
    socket.on(`${SocketEvent.BOARD_IMAGE_MAP_STATE_SYNC}`, handleBoradImageMapSync)
    socket.on(`${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`, handleBoardImageDropBroadcast)
    socket.on(`${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`, handleBoardImageRestoreBroadcast)
    socket.on(`${SocketEvent.BOARD_IMAGE_MAP_RESET_BROADCAST}`, handleBoardImageResetBroadcast)
  })

  onUnmounted(() => {
    socket.off(`${SocketEvent.BOARD_IMAGE_MAP_STATE_SYNC}`)
    socket.off(`${SocketEvent.BOARD_IMAGE_DROP_BROADCAST}`)
    socket.off(`${SocketEvent.BOARD_IMAGE_RESTORE_BROADCAST}`)
    socket.off(`${SocketEvent.BOARD_IMAGE_MAP_RESET_BROADCAST}`)
  })

  function handleBoardImageDrop({ imgId, zoneId }: { imgId: string; zoneId: string }) {
    console.log(`useBoardSync handleImageDropped current image map imgId ${imgId} zoneId ${zoneId}`)
    const previousZoneId = findZoneIdByImageId(imgId)
    const displacedImgId = boardImageMap.value[zoneId]

    if (displacedImgId && previousZoneId && previousZoneId !== zoneId) {
      swapImages(imgId, displacedImgId, zoneId, previousZoneId)
      socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId: previousZoneId })
      socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId })
      socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { imgId, zoneId })
      socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { imgId: displacedImgId, zoneId: previousZoneId })
    } else {
      if (previousZoneId) {
        removeImage(imgId, previousZoneId)
        socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId: previousZoneId })
      } else if (displacedImgId) {
        removeImage(displacedImgId, zoneId)
        socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId })
      }
      placeImage(imgId, zoneId)

      socket.emit(`${SocketEvent.BOARD_IMAGE_DROP_REQUEST}`, { imgId, zoneId })

      if (isCurrentStepZone(zoneId)) {
        advanceStep()
      }
    }
  }

  function handleBoardImageRestore({ imgId }: { imgId: string }) {
    console.log(`useBoardSync handleImageRestore current image map imgId ${imgId}`)
    const zoneId = findZoneIdByImageId(imgId)
    if (!zoneId) return
    removeImage(imgId, zoneId)
    socket.emit(`${SocketEvent.BOARD_IMAGE_RESTORE_REQUEST}`, { zoneId })
    console.log('[Client] Sent board.image.restore.request:', zoneId)
  }

  function handleBoardImageReset() {
    resetBoardImageMap()
    clearTacticalBoardIfNeeded()

    socket.emit(`${SocketEvent.BOARD_IMAGE_MAP_RESET_REQUEST}`)
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

    for (const [zoneId, charId] of Object.entries(boardImageMap.value)) {
      if (zoneId.startsWith('zone-ban')) grouped.ban[zoneId] = charId
      else if (zoneId.startsWith('zone-pick')) grouped.pick[zoneId] = charId
      else if (zoneId.startsWith('zone-utility')) grouped.utility[zoneId] = charId
      else grouped.other[zoneId] = charId
    }

    console.log('Grouped BanPick Data:', grouped)
  }

  function handleBoradImageMapSync(imageMap: Record<string, string>) {
    console.log(`handleBoradImageMapSync start`)
    setBoardImageMap(imageMap)
    for (const [zoneId, imgId] of Object.entries(boardImageMap.value)) {
      cloneToTacticalPoolIfNeeded(imgId, zoneId)
    }
  }

  function handleBoardImageDropBroadcast({ imgId, zoneId }: { imgId: string; zoneId: string }) {
    console.log(`[Client] image dropped received from other user imgId ${imgId} zoneId ${zoneId}`)
    placeImage(imgId, zoneId)
  }

  function handleBoardImageRestoreBroadcast({ zoneId }: { zoneId: string }) {
    const imgId = boardImageMap.value[zoneId]
    removeImage(imgId, zoneId)
  }

  function handleBoardImageResetBroadcast() {
    console.log(`[Client] image reset received from other user`)

    resetBoardImageMap()
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
    placeBoardImage(imgId, zoneId)
    cloneToTacticalPoolIfNeeded(imgId, zoneId)
  }

  function removeImage(imgId: string, zoneId: string) {
    removeBoardImage(zoneId)
    removeFromTacticalBoardIfNeeded(imgId, zoneId)
  }

  // --- Tactical Board ---

  function getTeamFromZone(zoneId: string): ITeam | undefined {
    const match = banPickSteps.value.find((f) => f.zoneId === zoneId && f.action === 'pick')
    return match?.team
  }

  function cloneToTacticalPoolIfNeeded(imgId: string, zoneId: string) {
    if (zoneId.includes('pick')) {
      const team = getTeamFromZone(zoneId)
      if (team) useTacticalBoardSync(team.id).addToPool(imgId)
    } else if (zoneId.includes('utility')) {

      for (const team of currentTeams.value) {
        useTacticalBoardSync(team.id).addToPool(imgId)
      }
    }
  }

  function removeFromTacticalBoardIfNeeded(imgId: string, zoneId: string) {
    if (zoneId.includes('pick')) {
      const team = getTeamFromZone(zoneId)
      if (team) useTacticalBoardSync(team.id).removeFromBoard(imgId)
    } else {
      for (const team of currentTeams.value) {
        useTacticalBoardSync(team.id).removeFromBoard(imgId)
      }
    }
  }

  function clearTacticalBoardIfNeeded() {
    for (const team of currentTeams.value) {
      useTacticalBoardSync(team.id).clearBoard()
    }
  }

  return {
    boardImageMap: readonly(boardImageMap),
    usedImageIds,
    handleBoardImageDrop,
    handleBoardImageRestore,
    handleBoardImageReset,
    handleBanPickRecord,
  }
}
