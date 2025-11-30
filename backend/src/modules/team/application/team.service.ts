// backend/src/modules/chat/application/team.service.ts

import { memberJoin } from '../domain/memberJoin';
import { memberLeave } from '../domain/memberLeave';

import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { IRoomStateRepository } from '../../room';

export default class TeamService {
    constructor(private roomStateRepository: IRoomStateRepository) {}

    join(roomId: string, { teamSlot, memberSlot, teamMember }: { teamSlot: number; memberSlot: number; teamMember: TeamMember }) {
        let nextTeamMembersMap = this.roomStateRepository.findTeamMembersMapById(roomId)
        nextTeamMembersMap = memberJoin(nextTeamMembersMap, teamSlot, memberSlot, teamMember)
        this.roomStateRepository.updateTeamMembersMapById(roomId, nextTeamMembersMap)
    }

    leave(roomId: string, { teamSlot, memberSlot }: { teamSlot: number; memberSlot: number }) {
        let nextTeamMembersMap = this.roomStateRepository.findTeamMembersMapById(roomId)
        nextTeamMembersMap = memberLeave(nextTeamMembersMap, teamSlot, memberSlot)
        this.roomStateRepository.updateTeamMembersMapById(roomId, nextTeamMembersMap)
    }

    getTeamMembersMap(roomId: string) {
        return this.roomStateRepository.findTeamMembersMapById(roomId);
    }
}
