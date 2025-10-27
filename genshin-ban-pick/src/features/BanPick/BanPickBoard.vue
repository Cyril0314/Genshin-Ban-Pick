<!-- src/features/BanPick/BanPickBoard.vue -->

<script setup lang="ts">
import { computed } from 'vue';

import BanZones from './components/BanZones.vue';
import PickZones from './components/PickZones.vue';
import StepIndicator from './components/StepIndicator.vue';
import UtilityZones from './components/UtilityZones.vue';

import { ZoneType } from '@/types/IZone';
import { useBoardZonesLayout } from './composables/useBoardZonesLayout';
import CharacterSelector from '@/features/CharacterSelector/CharacterSelector.vue';
import ChatRoom from '@/features/ChatRoom/ChatRoom.vue';
import RoomUserPool from '@/features/RoomUserPool/RoomUserPool.vue';
import TacticalBoardPanel from '@/features/Tactical/TacticalBoardPanel.vue';
import TeamInfo from '@/features/Team/TeamInfo.vue';

import type { ICharacter } from '@/types/ICharacter';
import type { IRoomSetting } from '@/types/IRoomSetting';
import type { ITeam, TeamMember, TeamMembersMap } from '@/types/ITeam';

const props = defineProps<{
    roomSetting: IRoomSetting;
    characterMap: Record<string, ICharacter>;
    boardImageMap: Record<number, string>;
    teams: ITeam[];
    teamMembersMap: TeamMembersMap;
}>();

const emit = defineEmits<{
    (e: 'image-drop', payload: { imgId: string; zoneId: number }): void;
    (e: 'image-restore', payload: { zoneId: number }): void;
    (e: 'filter-change', filteredCharacterIds: string[]): void;
    (e: 'random-pull', payload: { zoneType: ZoneType }): void;
    (e: 'member-drop', payload: { identityKey: string; teamId: number }): void;
    (e: 'member-input', payload: { name: string; teamId: number }): void;
    (e: 'member-restore', payload: { member: TeamMember; teamId: number }): void;
}>();

const teamInfoPair = computed(() => {
    const map = props.teamMembersMap;
    const teams = props.teams;
    if (teams.length < 2) return null;
    const [firstTeam, secondTeam] = teams;
    return {
        left: { ...firstTeam, members: map[firstTeam.id] ?? [] },
        right: { ...secondTeam, name: secondTeam.name, members: map[secondTeam.id] ?? [] },
    };
});

const { utilityZones, banZones, leftPickZones, rightPickZones, maxNumberOfUtilityPerColumn, maxNumberOfBanPerRow, maxNumberOfPickPerColumn } =
    useBoardZonesLayout(props.roomSetting, teamInfoPair.value!);

function handleImageDrop({ imgId, zoneId }: { imgId: string; zoneId: number }) {
    console.debug(`[BAN PICK BOARD] Handle image drop`, { imgId, zoneId });
    emit('image-drop', { imgId, zoneId });
}

function handleImageRestore({ zoneId }: { zoneId: number }) {
    console.debug(`[BAN PICK BOARD] Handle image restore`, { zoneId });
    emit('image-restore', { zoneId });
}

function handleSelectorFilterChange(filteredCharacterIds: string[]) {
    console.debug(`[BAN PICK BOARD] Handle selector filter change`, filteredCharacterIds);
    emit('filter-change', filteredCharacterIds);
}

function handleRandomPull({ zoneType }: { zoneType: ZoneType }) {
    console.debug(`[BAN PICK BOARD] Handle selector random button click`, { zoneType });
    emit('random-pull', { zoneType });
}

function handleMemberInput({ name, teamId }: { name: string; teamId: number }) {
    console.debug(`[BAN PICK BOARD] Handle member input`, { name, teamId });
    emit('member-input', { name, teamId });
}

function handleMemberDrop({ identityKey, teamId }: { identityKey: string; teamId: number }) {
    console.debug(`[BAN PICK BOARD] Handle member drop`, { identityKey, teamId });
    emit('member-drop', { identityKey, teamId });
}

function handleMemberRestore({ member, teamId }: { member: TeamMember; teamId: number }) {
    console.debug(`[BAN PICK BOARD] Handle member restore`, { member, teamId });
    emit('member-restore', { member, teamId });
}
</script>

<template>
    <div class="layout__main">
        <div class="layout__side layout__side--left">
            <TeamInfo
                v-if="teamInfoPair"
                side="left"
                :teamInfo="teamInfoPair.left"
                @member-input="handleMemberInput"
                @member-drop="handleMemberDrop"
                @member-restore="handleMemberRestore"
            />
            <PickZones
                v-if="leftPickZones"
                :zones="leftPickZones"
                :maxPerColumn="maxNumberOfPickPerColumn"
                side="left"
                :boardImageMap="props.boardImageMap"
                @image-drop="handleImageDrop"
                @image-restore="handleImageRestore"
            />
        </div>
        <div class="layout__center">
            <div class="layout__ban-zone">
                <BanZones
                    :zones="banZones"
                    :maxPerRow="maxNumberOfBanPerRow"
                    :boardImageMap="props.boardImageMap"
                    @image-drop="handleImageDrop"
                    @image-restore="handleImageRestore"
                />
            </div>
            <div class="layout__common">
                <div class="layout__common-side">
                    <ChatRoom />
                    <RoomUserPool />
                    <CharacterSelector
                        :characterMap="props.characterMap"
                        @filter-change="handleSelectorFilterChange"
                        @random-pull="handleRandomPull"
                    />
                </div>
                <div class="layout__common-center">
                    <div class="layout__step-indicator">
                        <StepIndicator />
                    </div>
                    <div class="layout__utility-zone">
                        <UtilityZones
                            :zones="utilityZones"
                            :maxPerColumn="maxNumberOfUtilityPerColumn"
                            :boardImageMap="props.boardImageMap"
                            @image-drop="handleImageDrop"
                            @image-restore="handleImageRestore"
                        />
                    </div>
                </div>
                <div class="layout__common-side">
                    <TacticalBoardPanel v-if="teamInfoPair" :teamInfoPair="teamInfoPair" />
                </div>
            </div>
        </div>
        <div class="layout__side layout__side--right">
            <TeamInfo
                v-if="teamInfoPair"
                side="right"
                :teamInfo="teamInfoPair.right"
                @member-input="handleMemberInput"
                @member-drop="handleMemberDrop"
                @member-restore="handleMemberRestore"
            />
            <PickZones
                v-if="rightPickZones"
                :zones="rightPickZones"
                :maxPerColumn="maxNumberOfPickPerColumn"
                side="right"
                :boardImageMap="props.boardImageMap"
                @image-drop="handleImageDrop"
                @image-restore="handleImageRestore"
            />
        </div>
    </div>
</template>

<style scoped>
.layout__main {
    display: flex;
    align-items: stretch;
    gap: var(--space-md);
    justify-content: center;
}

.layout__side {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: calc(var(--size-dropzone) * 2 + var(--size-drop-zone-line-space));
    gap: var(--space-md);
}

.layout__center {
    /* width: 100%; */
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    gap: var(--space-md);
}

.layout__ban-zone {
    position: relative;
    display: flex;
    align-items: center;
}

.layout__common {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: calc(var(--size-dropzone) * 3 + var(--size-drop-zone-item-space) * 2) 1fr calc(
            var(--size-dropzone) * 3 + var(--size-drop-zone-item-space) * 2
        ); /*  */
    gap: var(--size-ban-pick-common-space);
}

.layout__common-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    /* width: calc(var(--size-dropzone) * 3 + var(--size-drop-zone-item-space) * 2); */
    gap: var(--space-lg);
}

.layout__common-center {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.layout__step-indicator {
    display: flex;
    flex-grow: 4;
    align-items: center;
    justify-content: center;
}

.layout__utility-zone {
    display: flex;
    flex-grow: 5;
    align-items: start;
    justify-content: center;
}
</style>
