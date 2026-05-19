// src/modules/team/domain/handleMemberDropDomain.ts

import { isSameIdentity } from '@shared/contracts/auth/Identity';
import { createOnlineMemberDomain } from "./createOnlineMemberDomain";

import type { Identity } from '@shared/contracts/auth/Identity';
import type { IRoomUser } from '@shared/contracts/room/IRoomUser';
import type { TeamMember } from "@shared/contracts/team/TeamMember";
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';

export function handleMemberDropDomain(teamMembersMap: TeamMembersMap, roomUsers: IRoomUser[], identity: Identity, teamSlot: number): TeamMember | undefined {
    const roomUser = roomUsers.find((roomUser) => isSameIdentity(roomUser.identity, identity));
    if (!roomUser) return undefined;
    const teamMembers = Object.values(teamMembersMap[teamSlot]);
    if (teamMembers.some((m) => m.type !== 'Name' && isSameIdentity(m, roomUser.identity))) {
        return undefined;
    }
    let teamMember = createOnlineMemberDomain(roomUser);
    return teamMember
}