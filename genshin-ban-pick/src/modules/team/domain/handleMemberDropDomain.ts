// src/modules/team/domain/handleMemberDropDomain.ts

import { createOnlineMemberDomain } from "./createOnlineMemberDomain";

import type { IRoomUser } from '@shared/contracts/room/IRoomUser';
import type { TeamMember } from "@shared/contracts/team/TeamMember";
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function handleMemberDropDomain(teamMembersMap: TeamMembersMap, roomUsers: IRoomUser[], identityKey: string, teamSlot: number): TeamMember | undefined {
    const roomUser = roomUsers.find((roomUser) => roomUser.identityKey === identityKey);
    if (!roomUser) return undefined;
    const teamMembers = Object.values(teamMembersMap[teamSlot]);
    if (teamMembers.some((m) => m.type === 'Online' && m.user.identityKey === roomUser.identityKey)) {
        return undefined;
    }
    let teamMember = createOnlineMemberDomain(roomUser);
    return teamMember
}