// src/modules/team/domain/handleMemberDropDomain.ts

import type { IRoomUser } from "@/modules/room";
import type { TeamMember, TeamMembersMap } from "../types/TeamMember";
import { addTeamMemberDomain } from "./addTeamMemberDomain";
import { createOnlineMemberDomain } from "./createOnlineMemberDomain";
import { removeTeamMemberDomain } from "./removeTeamMemberDomain";

export function handleMemberDropDomain(teamMembersMap: TeamMembersMap, roomUsers: IRoomUser[], identityKey: string, teamSlot: number, memberSlot: number) {
    let nextMap = { ...teamMembersMap };
    const roomUser = roomUsers.find((roomUser) => roomUser.identityKey === identityKey);
    if (!roomUser) return { teamMembersMap: nextMap };
    const teamMembers = Object.values(teamMembersMap[teamSlot]);
    if (teamMembers.some((m) => m.type === 'Online' && m.user.identityKey === roomUser.identityKey)) {
        return { teamMembersMap: nextMap };
    }
    let teamMember = createOnlineMemberDomain(roomUser);

    for (const [teamSlot, members] of Object.entries(teamMembersMap)) {
        for (const [memberSlot, member] of Object.entries(members)) {
            if (member.type === 'Online' && member.user.identityKey === identityKey) {
                let nextTeamMemberMap = removeTeamMemberDomain(nextMap[Number(teamSlot)], Number(memberSlot));
                nextMap = {
                    ...nextMap,
                    [teamSlot]: nextTeamMemberMap,
                }
            }
        }
    }

    const nextTeamMemberMap = addTeamMemberDomain(nextMap[teamSlot], memberSlot, teamMember)

    return {
        teamMembersMap: {
            ...nextMap,
            [teamSlot]: nextTeamMemberMap,
        },
        teamMember,
    };
}