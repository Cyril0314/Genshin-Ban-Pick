import { PrismaClient } from '@prisma/client';

import { RoomStateManager } from '../socket/managers/RoomStateManager.ts';
import { RoomStatePersistenceService } from '../services/room/RoomStatePersistenceService.ts';
import { createRoomSetting } from '../factories/roomSettingFactory.ts';
import { ZoneType } from '../types/IZone.ts';
import { TeamMember, TeamMembersMap } from '../types/TeamMember.ts';
import { IRoomUser } from '../types/IRoomUser.ts';
import { IRoomState } from '../types/IRoomState.ts';

async function main() {
    const prisma = new PrismaClient();
    const service = new RoomStatePersistenceService(prisma);
    //
    // 1) 建立 roomSetting (模擬 UI 設定)
    //

    const roomSetting = createRoomSetting({});

    //
    // 2) 建立 roomState (模擬拖曳後的結果)
    //

    const members = await prisma.member.findMany();

    const guests = await prisma.guest.findMany();

    const dbUsers: TeamMember[] = [
        ...members.map((m) => ({
            type: 'Online' as const,
            user: {
                id: '111',
                identityKey: `Member:${m.id}`,
                nickname: m.nickname,
                timestamp: Date.now(),
            },
        })),
        ...guests.map((g) => ({
            type: 'Online' as const,
            user: {
                id: '111',
                identityKey: `Guest:${g.id}`,
                nickname: g.nickname,
                timestamp: Date.now(),
            },
        })),
    ];

    const manualUsers: TeamMember[] = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi'].map((name) => ({
        type: 'Manual' as const,
        name,
    }));
    const memberPools: TeamMember[] = [...dbUsers, ...manualUsers];
    let teamMembersMap: TeamMembersMap = takeTeamMembers(memberPools, roomSetting.numberOfSetupCharacter);

    console.log(`teamMembersMap`, teamMembersMap);

    const characters = await prisma.character.findMany({
        select: { key: true },
        orderBy: { id: 'asc' }, // 可按需求排序
    });
    const characterKeys = characters.map((character) => character.key);
    const bpCharacters = selectN(characterKeys, roomSetting.matchFlow.steps.length);
    let boardImageMap: Record<number, string> = {};

    let teamCharacterPools: Record<number, string[]> = {};

    for (const step of roomSetting.matchFlow.steps) {
        const characterKey = bpCharacters[step.index];
        boardImageMap[step.zoneId] = characterKey;
        const zone = roomSetting.zoneMetaTable[step.zoneId];
        switch (zone.type) {
            case ZoneType.Utility:
                for (const team of roomSetting.teams) {
                    const teamPool = teamCharacterPools[team.slot] || [];
                    teamPool.push(characterKey);
                    teamCharacterPools[team.slot] = teamPool;
                }

                break;

            case ZoneType.Pick:
                if (step.teamSlot !== null) {
                    const teamPool = teamCharacterPools[step.teamSlot] || [];
                    teamPool.push(characterKey);
                    teamCharacterPools[step.teamSlot] = teamPool;
                }

                break;
            case ZoneType.Ban:
                break;
        }
    }

    const tacticalCellCount = roomSetting.numberOfTeamSetup * roomSetting.numberOfSetupCharacter;
    const teamTacticalBoardMap: Record<number, Record<number, string>> = Object.fromEntries(
        roomSetting.teams.map((team) => [
            team.slot,
            Object.fromEntries(selectN(teamCharacterPools[team.slot], tacticalCellCount).map((key, i) => [i, key])),
        ]),
    );

    const roomState: IRoomState = {
        teamMembersMap,
        boardImageMap: boardImageMap,
        characterRandomContextMap: {},
        teamTacticalBoardMap: teamTacticalBoardMap,
        users: [],
        chatMessages: [],
        stepIndex: Object.values(roomSetting.zoneMetaTable).length,
        roomSetting
    };

    //
    // 3) 呼叫 save() 寫入資料庫
    //
    const result = await service.save(roomState, true);

    console.log('\n✅ Match saved successfully!');
    console.log('Match ID:', result?.id);
    console.log(
        'Teams:',
        result?.teams.map((t) => ({ slot: t.slot, count: t.teamMembers.length })),
    );

    function shuffled<T>(arr: T[]): T[] {
        return [...arr].sort(() => Math.random() - 0.5);
    }

    function selectN<T>(arr: T[], n: number): T[] {
        return shuffled(arr).slice(0, n);
    }

    function takeTeamMembers(pool: TeamMember[], membersPerTeam: number): TeamMembersMap {
        const shuffledPool = shuffled(pool);
        const map: TeamMembersMap = {};
        let i = 0;

        for (const team of roomSetting.teams) {
            map[team.slot] = {};
            for (let slot = 0; slot < membersPerTeam; slot++) {
                map[team.slot][slot] = shuffledPool[i % shuffledPool.length];
                i++;
            }
        }

        return map;
    }
}

main().catch(console.error);
