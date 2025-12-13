import { PrismaClient } from '@prisma/client';

import MatchRepository from '../src/modules/match/infra/MatchRepository';
import { ZoneType } from '@shared/contracts/board/value-types';
import { createRoomSetting } from '../src/modules/room/domain/createRoomSetting';

import type { TeamMember } from '@shared/contracts/team/TeamMember';
import type { TeamMembersMap } from '@shared/contracts/team/TeamMembersMap';
import type { CharacterRandomContextMap } from '@shared/contracts/character/CharacterRandomContextMap';
import type { ICharacter } from '@shared/contracts/character/ICharacter';
import { mapCharacter } from '../src/modules/character';

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
        orderBy: { id: 'asc' }, // 可按需求排序
    });
    const bpCharacters = selectN(characters.map(mapCharacter), roomSetting.matchFlow.steps.length);
    let boardImageMap: Record<number, string> = {};
    let teamCharacterPools: Record<number, string[]> = {};
    let characterRandomContextMap: CharacterRandomContextMap = {};

    for (const step of roomSetting.matchFlow.steps) {
        const character = bpCharacters[step.index];
        boardImageMap[step.zoneId] = character.key;
        const zone = roomSetting.zoneMetaTable[step.zoneId];
        switch (zone.type) {
            case ZoneType.Utility:
                for (const team of roomSetting.teams) {
                    const teamPool = teamCharacterPools[team.slot] || [];
                    teamPool.push(character.key);
                    teamCharacterPools[team.slot] = teamPool;
                }

                characterRandomContextMap[character.key] = generateRandomContext(character);
                break;

            case ZoneType.Pick:
                if (step.teamSlot !== null) {
                    const teamPool = teamCharacterPools[step.teamSlot] || [];
                    teamPool.push(character.key);
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

    const repository = new MatchRepository(prisma);
    const result = await repository.create(
        {
            roomId: 'test',
            roomSetting,
            teamMembersMap,
            boardImageMap,
            teamTacticalCellImageMap,
            characterRandomContextMap,
        },
        true,
    );

    console.log('\n✅ Match saved successfully!');
    // console.log('Match:', JSON.stringify(result.moves, null, 2));

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

    function generateRandomContext(useredByCharacter: ICharacter) {
        return {
            characterFilter: {
                ['rarity']: [useredByCharacter.rarity],
                ['weapon']: [useredByCharacter.weapon],
                ['element']: [useredByCharacter.element],
                ['region']: [useredByCharacter.region],
                ['role']: [useredByCharacter.role],
                ['modelType']: [useredByCharacter.modelType],
                ['wish']: [useredByCharacter.wish],
            },
        };
    }
}

main().catch(console.error);
