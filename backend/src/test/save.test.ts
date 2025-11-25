import { PrismaClient } from '@prisma/client';

import { ZoneType } from '../types/IZone.ts';
import { TeamMember, TeamMembersMap } from '../types/TeamMember.ts';
import MatchService from '../modules/match/application/match.service.ts';
import { IMatchSnapshotRepository } from '../modules/match/domain/IMatchSnapshotRepository.ts';
import { IMatchSnapshot } from '../modules/match/domain/IMatchSnapshot.ts';
import { createRoomSetting } from '../modules/room/domain/createRoomSetting.ts';

class MockSnapshotRepository implements IMatchSnapshotRepository {
    snapshot: IMatchSnapshot

    constructor(snapshot: IMatchSnapshot) {
        this.snapshot = snapshot
    }

    getSnapshot(roomId: string) {
        return this.snapshot
    }
}

async function main() {
    const prisma = new PrismaClient();

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
    const teamTacticalCellImageMap: Record<number, Record<number, string>> = Object.fromEntries(
        roomSetting.teams.map((team) => [
            team.slot,
            Object.fromEntries(selectN(teamCharacterPools[team.slot], tacticalCellCount).map((key, i) => [i, key])),
        ]),
    );

    //
    // 3) 呼叫 save() 寫入資料庫
    //
    const repository = new MockSnapshotRepository({
        roomId: "test",
        roomSetting,
        teamMembersMap,
        boardImageMap,
        teamTacticalCellImageMap,
        characterRandomContextMap: {},
    })
    const service = new MatchService(prisma, repository);
    const result = await service.saveMatch("test", true);

    console.log('\n✅ Match saved successfully!');
    console.log('Match ID:', result);

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
