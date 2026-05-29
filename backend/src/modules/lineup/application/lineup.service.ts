// backend/src/modules/lineup/application/lineup.service.ts

import { imagePlace } from '../domain/imagePlace';
import { imageRemove } from '../domain/imageRemove';
import { imageMapReset } from '../domain/imageMapReset';

import type { IRoomStateRepository } from '../../room';

export default class LineupService {
    constructor(private roomStateRepository: IRoomStateRepository) {}

    place(roomId: string, payload: { teamSlot: number; cellId: number; imgId: string }) {
        const teamSlot = payload.teamSlot;
        let nextTeamLineupImageMap = this.roomStateRepository.findTeamLineupImageMapById(roomId);
        let nextLineupImageMap = nextTeamLineupImageMap[payload.teamSlot];
        nextLineupImageMap = imagePlace(nextLineupImageMap, payload.cellId, payload.imgId);

        nextTeamLineupImageMap = {
            ...nextTeamLineupImageMap,
            [teamSlot]: nextLineupImageMap,
        };
        this.roomStateRepository.updateTeamLineupImageMapById(roomId, nextTeamLineupImageMap);
    }

    remove(roomId: string, payload: { teamSlot: number; cellId: number }) {
        const teamSlot = payload.teamSlot;
        let nextTeamLineupImageMap = this.roomStateRepository.findTeamLineupImageMapById(roomId);
        let nextLineupImageMap = nextTeamLineupImageMap[payload.teamSlot];
        nextLineupImageMap = imageRemove(nextLineupImageMap, payload.cellId);

        nextTeamLineupImageMap = {
            ...nextTeamLineupImageMap,
            [teamSlot]: nextLineupImageMap,
        };
        this.roomStateRepository.updateTeamLineupImageMapById(roomId, nextTeamLineupImageMap);
    }

    reset(roomId: string, payload: { teamSlot: number }) {
        const teamSlot = payload.teamSlot;
        let nextTeamLineupImageMap = this.roomStateRepository.findTeamLineupImageMapById(roomId);
        let nextLineupImageMap = nextTeamLineupImageMap[payload.teamSlot];
        nextLineupImageMap = imageMapReset(nextLineupImageMap);

        nextTeamLineupImageMap = {
            ...nextTeamLineupImageMap,
            [teamSlot]: nextLineupImageMap,
        };
        this.roomStateRepository.updateTeamLineupImageMapById(roomId, nextTeamLineupImageMap);
    }

    resetAll(roomId: string) {
        let nextTeamLineupImageMap = this.roomStateRepository.findTeamLineupImageMapById(roomId);
        for (const teamSlotString of Object.keys(nextTeamLineupImageMap)) {
            const teamSlot = Number(teamSlotString);
            nextTeamLineupImageMap = {
                ...nextTeamLineupImageMap,
                [teamSlot]: imageMapReset(nextTeamLineupImageMap[teamSlot]),
            };
        }
        this.roomStateRepository.updateTeamLineupImageMapById(roomId, nextTeamLineupImageMap);
    }

    getTeamLineupImageMap(roomId: string) {
        return this.roomStateRepository.findTeamLineupImageMapById(roomId);
    }
}
