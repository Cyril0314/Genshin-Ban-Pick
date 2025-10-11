// src/features/TacticalBoard/useTacticalBoardSync.ts
import type { ITeam } from '@/types/ITeam'
import { ref } from 'vue'

type TacticalMap = Record<string, string>

const boardPools: Record<number, ReturnType<typeof createTeamBoard>> = {}

export function useTacticalBoardSync(teamId: number) {
  if (!boardPools[teamId]) {
    boardPools[teamId] = createTeamBoard()
  }
  return boardPools[teamId]
}

function createTeamBoard() {
  const cellMap = ref<TacticalMap>({})
  const tacticalPoolImages = ref<string[]>([])

  function handleCellDrop({ zoneId, imgId }: { zoneId: string; imgId: string }) {
    for (const [k, v] of Object.entries(cellMap.value)) {
      if (v === imgId) delete cellMap.value[k]
    }
    cellMap.value[zoneId] = imgId
  }

  function handleCellClear({ zoneId }: { zoneId: string }) {
    delete cellMap.value[zoneId]
  }

  function addToPool(imgId: string) {
    if (!tacticalPoolImages.value.includes(imgId)) {
      tacticalPoolImages.value.push(imgId)
    }
  }

  function removeFromBoard(imgId: string) {
    const index = tacticalPoolImages.value.indexOf(imgId)
    if (index !== -1) {
      tacticalPoolImages.value.splice(index, 1)
    }
    for (const [k, v] of Object.entries(cellMap.value)) {
      if (v === imgId) delete cellMap.value[k]
    }
  }

  function clearBoard() {
    tacticalPoolImages.value = []
    cellMap.value = {}
  }

  return {
    cellMap,
    tacticalPoolImages,
    handleCellDrop,
    handleCellClear,
    addToPool,
    removeFromBoard,
    clearBoard
  }
}
