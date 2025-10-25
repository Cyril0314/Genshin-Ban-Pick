<!-- src/features/BanPick/BanPickBoard.vue -->

<script setup lang="ts">
import {} from 'vue';

import BanZones from './components/BanZones.vue';
import PickZones from './components/PickZones.vue';
import StepIndicator from './components/StepIndicator.vue';
import UtilityZones from './components/UtilityZones.vue';

import type { ICharacter } from '@/types/ICharacter';
import type { IRoomSetting } from '@/types/IRoomSetting';
import type { ZoneType } from '@/types/IZone';

import CharacterSelector from '@/features/CharacterSelector/CharacterSelector.vue';
import ChatRoom from '@/features/ChatRoom/ChatRoom.vue';
import RoomUserPool from '@/features/RoomUserPool/RoomUserPool.vue';
import TacticalBoardPanel from '@/features/Tactical/TacticalBoardPanel.vue';
import { useTeamInfoSync } from '@/features/Team/composables/useTeamInfoSync';
import TeamInfo from '@/features/Team/TeamInfo.vue';

const props = defineProps<{
    roomSetting: IRoomSetting;
    characterMap: Record<string, ICharacter>;
    boardImageMap: Record<number, string>;
}>();

const { teamInfoPair } = useTeamInfoSync();

const emit = defineEmits<{
    (e: 'image-drop', payload: { imgId: string; zoneId: number }): void;
    (e: 'image-restore', payload: { zoneId: number }): void;
    (e: 'filter-change', filteredCharacterIds: string[]): void;
    (e: 'random-button-click', payload: { zoneType: ZoneType }): void;
}>();

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

function handleRandomButtonClick({ zoneType }: { zoneType: ZoneType }) {
    console.debug(`[BAN PICK BOARD] Handle selector random button click`, { zoneType });
    emit('random-button-click', { zoneType });
}
</script>

<template>
    <div class="layout__main">
        <div class="layout__side layout__side--left">
            <TeamInfo side="left" v-if="teamInfoPair" :teamId="teamInfoPair.left.id" />
            <PickZones
                :zones="props.roomSetting.zoneSchema.leftPickZones"
                :maxPerColumn="props.roomSetting.zoneSchema.maxNumberOfPickPerColumn"
                side="left"
                :boardImageMap="props.boardImageMap"
                @image-drop="handleImageDrop"
                @image-restore="handleImageRestore"
            />
        </div>
        <div class="layout__center">
            <div class="layout__ban-zone">
                <BanZones
                    :zones="props.roomSetting.zoneSchema.banZones"
                    :maxPerRow="props.roomSetting.zoneSchema.maxNumberOfBanPerRow"
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
                        @random-button-click="handleRandomButtonClick"
                    />
                </div>
                <div class="layout__common-center">
                    <div class="layout__step-indicator">
                        <StepIndicator />
                    </div>
                    <div class="layout__utility-zone">
                        <UtilityZones
                            :zones="props.roomSetting.zoneSchema.utilityZones"
                            :maxPerColumn="props.roomSetting.zoneSchema.maxNumberOfUtilityPerColumn"
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
            <TeamInfo side="right" v-if="teamInfoPair" :teamId="teamInfoPair.right.id" />
            <PickZones
                :zones="props.roomSetting.zoneSchema.rightPickZones"
                :maxPerColumn="props.roomSetting.zoneSchema.maxNumberOfPickPerColumn"
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
        );
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
