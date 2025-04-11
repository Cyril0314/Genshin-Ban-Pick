<!-- src/features/BanPick/BanPickBoard.vue -->

<script setup lang="ts">
import DropZone from './DropZone.vue'
import { ref } from 'vue'
import BanZone from './BanZone.vue'
import PickZone from './PickZone.vue'
import UtilityZone from './UtilityZone.vue'
import type { RoomSetting } from '@/types/RoomSetting'

const zoneIds = ['zone-1', 'zone-2', 'zone-3']
const imageState = ref<Record<string, string>>({})

function handleDrop({ imgId, zoneId }: { imgId: string; zoneId: string }) {
    imageState.value[zoneId] = imgId
}

function handleRestore({ imgId }: { imgId: string }) {
    for (const zone in imageState.value) {
        if (imageState.value[zone] === imgId) {
            delete imageState.value[zone]
        }
    }
}
</script>

<template>
    <div class="layout__main">
        <BanZone :count="props.roomSetting.numberOfBan" :totalRounds="props.roomSetting.totalRounds" />
        <div class="layout__columns">
            <PickZone side="left" :count="props.roomSetting.numberOfPick / 2" />
            <UtilityZone :count="props.roomSetting.numberOfUtility" />
            <PickZone side="right" :count="props.roomSetting.numberOfPick / 2" />
        </div>
    </div>
</template>