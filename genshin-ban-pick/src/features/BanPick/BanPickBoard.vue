<!-- src/features/BanPick/BanPickBoard.vue -->

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

import ImageOptions from '../ImageOptions/ImageOptions.vue';
import CharacterSelector from '@/features/CharacterSelector/CharacterSelector.vue';
import TeamInfo from '@/features/Team/TeamInfo.vue';
import BanZones from './components/BanZones.vue';
import PickZones from './components/PickZones.vue';
import UtilityZones from './components/UtilityZones.vue';

import { ZoneType } from '@/types/IZone';
import { useBoardZonesLayout } from './composables/useBoardZonesLayout';
import { useTeamInfoStore } from '@/stores/teamInfoStore';

import type { ICharacter } from '@/types/ICharacter';
import type { IRoomSetting } from '@/types/IRoomSetting';
import type { TeamMember } from '@/types/TeamMember';

const props = defineProps<{
    roomSetting: IRoomSetting;
    characterMap: Record<string, ICharacter>;
    boardImageMap: Record<number, string>;
    usedImageIds: string[];
    filteredCharacterKeys: string[] | null;
}>();

const emit = defineEmits<{
    (e: 'image-drop', payload: { zoneId: number; imgId: string }): void;
    (e: 'image-restore', payload: { zoneId: number }): void;
    (e: 'filter-change', filteredCharacterKeys: string[]): void;
    (e: 'random-pull', payload: { zoneType: ZoneType }): void;
    (e: 'member-drop', payload: { identityKey: string; teamSlot: number }): void;
    (e: 'member-input', payload: { name: string; teamSlot: number }): void;
    (e: 'member-restore', payload: { member: TeamMember; teamSlot: number }): void;
}>();

const teamInfoStore = useTeamInfoStore();
const { teamInfoPair } = storeToRefs(teamInfoStore);

const { utilityZones, banZones, leftPickZones, rightPickZones, maxNumberOfUtilityPerRow, maxNumberOfBanPerRow, maxNumberOfPickPerColumn } =
    useBoardZonesLayout(props.roomSetting, teamInfoPair.value!);

function handleImageDrop({ zoneId, imgId }: { zoneId: number; imgId: string }) {
    console.debug(`[BAN PICK BOARD] Handle image drop`, { zoneId, imgId });
    emit('image-drop', { zoneId, imgId });
}

function handleImageRestore({ zoneId }: { zoneId: number }) {
    console.debug(`[BAN PICK BOARD] Handle image restore`, { zoneId });
    emit('image-restore', { zoneId });
}

function handleSelectorFilterChange(filteredCharacterKeys: string[]) {
    console.debug(`[BAN PICK BOARD] Handle selector filter change`, filteredCharacterKeys);
    emit('filter-change', filteredCharacterKeys);
}

function handleRandomPull({ zoneType }: { zoneType: ZoneType }) {
    console.debug(`[BAN PICK BOARD] Handle selector random button click`, { zoneType });
    emit('random-pull', { zoneType });
}

function handleMemberInput({ name, teamSlot }: { name: string; teamSlot: number }) {
    console.debug(`[BAN PICK BOARD] Handle member input`, { name, teamSlot });
    emit('member-input', { name, teamSlot });
}

function handleMemberDrop({ identityKey, teamSlot }: { identityKey: string; teamSlot: number }) {
    console.debug(`[BAN PICK BOARD] Handle member drop`, { identityKey, teamSlot });
    emit('member-drop', { identityKey, teamSlot });
}

function handleMemberRestore({ member, teamSlot }: { member: TeamMember; teamSlot: number }) {
    console.debug(`[BAN PICK BOARD] Handle member restore`, { member, teamSlot });
    emit('member-restore', { member, teamSlot });
}
</script>

<template>
    <!-- <div class="ban-pick-board"> -->
    <div class="layout__main"
        :style="{ '--max-number-of-pick-per-column': maxNumberOfPickPerColumn, '--max-number-of-ban-per-row': maxNumberOfBanPerRow, '--max-number-of-utility-per-row': maxNumberOfUtilityPerRow }">
        <div class="layout__side layout__side--left">
            <TeamInfo v-if="teamInfoPair" side="left" :teamInfo="teamInfoPair.left" @member-input="handleMemberInput"
                @member-drop="handleMemberDrop" @member-restore="handleMemberRestore" />
            <PickZones v-if="leftPickZones" :zones="leftPickZones" :maxPerColumn="maxNumberOfPickPerColumn" side="left"
                :boardImageMap="props.boardImageMap" @image-drop="handleImageDrop"
                @image-restore="handleImageRestore" />
        </div>
        <div class="layout__center">
            <div class="layout__ban-zone">
                <BanZones :zones="banZones" :maxPerRow="maxNumberOfBanPerRow" :boardImageMap="props.boardImageMap"
                    @image-drop="handleImageDrop" @image-restore="handleImageRestore" />
            </div>
            <div class="layout__common">
                <ImageOptions v-if="characterMap" :characterMap="characterMap" :usedImageIds="usedImageIds"
                    :filteredCharacterKeys="filteredCharacterKeys" />


                <CharacterSelector :characterMap="props.characterMap" @filter-change="handleSelectorFilterChange"
                    @random-pull="handleRandomPull" />
            </div>
            <div class="layout__utility-zone">
                <UtilityZones :zones="utilityZones" :maxPerRow="maxNumberOfUtilityPerRow"
                    :boardImageMap="props.boardImageMap" @image-drop="handleImageDrop"
                    @image-restore="handleImageRestore" />
            </div>
        </div>
        <div class="layout__side layout__side--right">
            <TeamInfo v-if="teamInfoPair" side="right" :teamInfo="teamInfoPair.right" @member-input="handleMemberInput"
                @member-drop="handleMemberDrop" @member-restore="handleMemberRestore" />
            <PickZones v-if="rightPickZones" :zones="rightPickZones" :maxPerColumn="maxNumberOfPickPerColumn"
                side="right" :boardImageMap="props.boardImageMap" @image-drop="handleImageDrop"
                @image-restore="handleImageRestore" />
        </div>
    </div>
    <!-- </div> -->
</template>

<style scoped>
.layout__main {
    --pick-per-column-count: var(--max-number-of-pick-per-column);
    --layout-main-height: calc((var(--pick-per-column-count) + 1) * var(--size-drop-zone-height) + var(--pick-per-column-count) * var(--size-drop-zone-item-space));

    --ban-per-row-count: var(--max-number-of-ban-per-row);
    --layout-center-width: calc(var(--ban-per-row-count) * var(--size-drop-zone-width) + var(--ban-per-row-count) * var(--size-drop-zone-item-space) + var(--size-ban-row-spacer));

    display: flex;
    justify-content: space-evenly;
    gap: var(--space-xl);
    min-height: 0;
    height: var(--layout-main-height);
}

.layout__side {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
    width: min-content;
}

.layout__center {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    min-height: 0;
    height: 100%;
    width: var(--layout-center-width);
}

.layout__ban-zone {
    display: flex;
    align-items: center;
}

.layout__common {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
    min-height: 0;
    width: 100%;
}

.layout__utility-zone {
    display: flex;
    align-items: start;
    justify-content: center;
}
</style>
