<!-- src/modules/board/ui/components/BanPickBoard.vue -->

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import CharacterSelector from '@/modules/character/ui/components/CharacterSelector.vue';
import TeamInfo from '@/modules/team/ui/components/TeamInfo.vue';
import ImageOptions from './ImageOptions.vue';
import BanZones from './BanZones.vue';
import PickZones from './PickZones.vue';
import UtilityZones from './UtilityZones.vue';

import { useTeamInfoStore } from '@/modules/team';
import { ZoneType } from '../../types/IZone';
import { useBoardZonesLayout } from '../composables/useBoardZonesLayout';

import type { ICharacter, CharacterFilterKey } from '@/modules/character';
import type { IRoomSetting } from '@/modules/room';

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
    (e: 'filter-change', payload: { filteredCharacterKeys: string[]; characterFilter: Record<CharacterFilterKey, string[]> }): void;
    (e: 'random-pull', payload: { zoneType: ZoneType }): void;
    (e: 'member-drop', payload: { identityKey: string; teamSlot: number; memberSlot: number }): void;
    (e: 'member-input', payload: { name: string; teamSlot: number; memberSlot: number }): void;
    (e: 'member-restore', payload: { teamSlot: number; memberSlot: number }): void;
}>();

const teamInfoStore = useTeamInfoStore();
const { teamInfoPair } = storeToRefs(teamInfoStore);

const { utilityZones, banZones, leftPickZones, rightPickZones, maxNumberOfUtilityPerRow, maxNumberOfBanPerRow, maxNumberOfPickPerColumn } =
    useBoardZonesLayout(props.roomSetting, teamInfoPair.value!);

function handleImageDrop(payload: { zoneId: number; imgId: string }) {
    console.debug(`[BAN PICK BOARD] Handle image drop`, payload);
    emit('image-drop', payload);
}

function handleImageRestore(payload: { zoneId: number }) {
    console.debug(`[BAN PICK BOARD] Handle image restore`, payload);
    emit('image-restore', payload);
}

function handleSelectorFilterChange(payload: { filteredCharacterKeys: string[]; characterFilter: Record<CharacterFilterKey, string[]> }) {
    console.debug(`[BAN PICK BOARD] Handle selector filter change`, payload);
    emit('filter-change', payload);
}

function handleRandomPull(payload: { zoneType: ZoneType }) {
    console.debug(`[BAN PICK BOARD] Handle selector random button click`, payload);
    emit('random-pull', payload);
}

function handleMemberInput(payload: { name: string; teamSlot: number; memberSlot: number }) {
    console.debug(`[BAN PICK BOARD] Handle member input`, payload);
    emit('member-input', payload);
}

function handleMemberDrop(payload: { identityKey: string; teamSlot: number; memberSlot: number }) {
    console.debug(`[BAN PICK BOARD] Handle member drop`, payload);
    emit('member-drop', payload);
}

function handleMemberRestore(payload: { teamSlot: number; memberSlot: number }) {
    console.debug(`[BAN PICK BOARD] Handle member restore`, payload);
    emit('member-restore', payload);
}
</script>

<template>
    <!-- <div class="ban-pick-board"> -->
    <div class="layout__main"
        :style="{ '--max-number-of-pick-per-column': maxNumberOfPickPerColumn, '--max-number-of-ban-per-row': maxNumberOfBanPerRow, '--max-number-of-utility-per-row': maxNumberOfUtilityPerRow }">
        <div class="layout__side layout__side--left">
            <TeamInfo v-if="teamInfoPair" side="left" :teamInfo="teamInfoPair.left" :numberOfSetupCharacter="roomSetting.numberOfSetupCharacter" @member-input="handleMemberInput"
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
            <TeamInfo v-if="teamInfoPair" side="right" :teamInfo="teamInfoPair.right" :numberOfSetupCharacter="roomSetting.numberOfSetupCharacter" @member-input="handleMemberInput"
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
    --layout-main-height: calc(var(--space-lg) + var(--size-team-info-height) + var(--space-md) + var(--pick-per-column-count) * var(--size-drop-zone-height) + (var(--pick-per-column-count) + 1) * var(--size-drop-zone-space) + var(--space-lg));
    --ban-per-row-count: var(--max-number-of-ban-per-row);
    --layout-center-width: calc(var(--ban-per-row-count) * var(--size-drop-zone-width) + (var(--ban-per-row-count) + 2) * var(--size-drop-zone-space));

    display: flex;
    justify-content: center;
    padding: var(--space-lg);
    gap: var(--space-xl);
    min-height: 0;
    height: var(--layout-main-height);
    background-color: var(--md-sys-color-surface);
    border-radius: var(--radius-xl);
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
    gap: var(--space-xl);
    min-height: 0;
    height: 100%;
    width: var(--layout-center-width);
}

.layout__ban-zone {
    display: flex;
    align-items: center;
    justify-content: center;
}

.layout__common {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-xl);
    min-height: 0;
    width: 100%;
}

.layout__utility-zone {
    display: flex;
    align-items: start;
    justify-content: center;
}
</style>
