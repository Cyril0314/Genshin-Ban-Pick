// backend/src/modules/chat/application/tactical.service.ts

import { imagePlace } from '../domain/imagePlace';
import { imageRemove } from '../domain/imageRemove';
import { imageMapReset } from '../domain/imageMapReset';

import type { IRoomStateRepository } from '../../room';

export default class TacticalService {
    constructor(private roomStateRepository: IRoomStateRepository) {}

    place(roomId: string, payload: { teamSlot: number; cellId: number; imgId: string }) {
        const teamSlot = payload.teamSlot
        let nextTeamTacticalCellImageMap = this.roomStateRepository.findTeamTacticalCellImageMapById(roomId)
        let nextTacticalCellImageMap = nextTeamTacticalCellImageMap[payload.teamSlot]
        nextTacticalCellImageMap = imagePlace(nextTacticalCellImageMap, payload.cellId, payload.imgId)

        nextTeamTacticalCellImageMap = {
            ...nextTeamTacticalCellImageMap,
            [teamSlot]: nextTacticalCellImageMap
        }
        this.roomStateRepository.updateTeamTacticalCellImageMapById(roomId, nextTeamTacticalCellImageMap)
    }

    remove(roomId: string, payload: { teamSlot: number; cellId: number}) {
        const teamSlot = payload.teamSlot
        let nextTeamTacticalCellImageMap = this.roomStateRepository.findTeamTacticalCellImageMapById(roomId)
        let nextTacticalCellImageMap = nextTeamTacticalCellImageMap[payload.teamSlot]
        nextTacticalCellImageMap = imageRemove(nextTacticalCellImageMap, payload.cellId)

        nextTeamTacticalCellImageMap = {
            ...nextTeamTacticalCellImageMap,
            [teamSlot]: nextTacticalCellImageMap
        }
        this.roomStateRepository.updateTeamTacticalCellImageMapById(roomId, nextTeamTacticalCellImageMap)
    }

    reset(roomId: string, payload: { teamSlot: number }) {
        const teamSlot = payload.teamSlot
        let nextTeamTacticalCellImageMap = this.roomStateRepository.findTeamTacticalCellImageMapById(roomId)
        let nextTacticalCellImageMap = nextTeamTacticalCellImageMap[payload.teamSlot]
        nextTacticalCellImageMap = imageMapReset(nextTacticalCellImageMap)

        nextTeamTacticalCellImageMap = {
            ...nextTeamTacticalCellImageMap,
            [teamSlot]: nextTacticalCellImageMap
        }
        this.roomStateRepository.updateTeamTacticalCellImageMapById(roomId, nextTeamTacticalCellImageMap)
    }

    getTeamTacticalCellImageMap(roomId: string) {
        return this.roomStateRepository.findTeamTacticalCellImageMapById(roomId);
    }
}
