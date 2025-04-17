<!-- src/features/BanPick/BanPickBoard.vue -->

<script setup lang="ts">
import { computed } from 'vue'
import { useTeamInfoSync } from '@/features/Team/composables/useTeamInfoSync'
import TeamInfo from '@/features/Team/TeamInfo.vue'
import type { TeamInfoModel } from '@/features/Team/composables/useTeamInfoSync'
import BanZone from './components/BanZone.vue'
import PickZone from './components/PickZone.vue'
import UtilityZone from './components/UtilityZone.vue'
import StepIndicator from './components/StepIndicator.vue'
import {
  generateUtilityOrder,
  generateBanOrder,
  generatePickOrder,
} from '@/features/BanPick/composables/useBanPickOrder'
import type { RoomSetting } from '@/types/RoomSetting'
import type { CharacterInfo } from '@/types/CharacterInfo'
import ChatRoom from '@/features/ChatRoom/ChatRoom.vue'
import TacticalBoardPanel from '@/features/Tactical/TacticalBoardPanel.vue'
import CharacterSelector from '@/features/CharacterSelector/CharacterSelector.vue'
import { useBanPickStep } from '@/features/BanPick/composables/useBanPickStep'

const props = defineProps<{
  roomSetting: RoomSetting
  characterMap: Record<string, CharacterInfo>
  imageMap: Record<string, string>
}>()

const { teamInfoMap, updateTeam } = useTeamInfoSync()

const emit = defineEmits<{
  (e: 'image-drop', payload: { imgId: string; zoneId: string }): void
  (e: 'image-restore', payload: { imgId: string }): void
  (e: 'filter-changed', filters: Record<string, string>): void
  (e: 'pull', payload: { zoneType: 'utility' | 'ban' | 'pick' }): void
}>()

const utilityZones = computed(() => generateUtilityOrder(props.roomSetting.numberOfUtility))

const banZones = computed(() =>
  generateBanOrder(props.roomSetting.numberOfBan, 8, props.roomSetting.totalRounds),
)

const pickZones = computed(() =>
  generatePickOrder(props.roomSetting.numberOfPick, props.roomSetting.totalRounds),
)

const { currentStep } = useBanPickStep()

function handleImageDropped({ imgId, zoneId }: { imgId: string; zoneId: string }) {
  console.log(`BanPickBoard handleImageDropped imgId ${imgId} zoneId ${zoneId}`)
  emit('image-drop', { imgId, zoneId })
}

function handleImageRestore({ imgId }: { imgId: string }) {
  console.log(`BanPickBoard handleImageRestore imgId ${imgId}`)
  emit('image-restore', { imgId })
}

function handleSelectorFilterChanged(filters: Record<string, string>) {
  emit('filter-changed', filters)
}

function handleSelectorPull({ zoneType }: { zoneType: 'utility' | 'ban' | 'pick' }) {
  emit('pull', { zoneType })
}

console.log('[BanPickBoard] setup start')
console.log('props.roomSetting', props.roomSetting)
console.log(`utilityZones: ${utilityZones.value}`)
console.log(`banZones: ${banZones.value}`)
console.log(`pickZones: ${pickZones.value}`)
console.log(`pickZones: ${pickZones.value.left}`)
console.log(`pickZones: ${pickZones.value.right}`)
</script>

<template>
  <div class="layout__main">
    <div class="layout__side layout__side--left">
      <TeamInfo
        team="aether"
        v-model="teamInfoMap.aether"
        @update:modelValue="(val: TeamInfoModel) => updateTeam('aether', val)"
      />
      <PickZone
        :zones="pickZones.left"
        side="left"
        :imageMap="props.imageMap"
        @image-drop="handleImageDropped"
        @image-restore="handleImageRestore"
      />
    </div>
    <div class="layout__center">
      <div class="layout__ban-zone">
        <BanZone
          :zones="banZones"
          :imageMap="props.imageMap"
          @image-drop="handleImageDropped"
          @image-restore="handleImageRestore"
        />
      </div>
      <div class="layout__common">
        <div class="layout__common-side">
          <CharacterSelector
            :characterMap="props.characterMap"
            @filter-changed="handleSelectorFilterChanged"
            @pull="handleSelectorPull"
          />
          <ChatRoom />
        </div>
        <div class="layout__utility-zone">
          <div class="layout__step-indicator">
            <StepIndicator :step="currentStep" />
          </div>
          <UtilityZone
            :zones="utilityZones"
            :imageMap="props.imageMap"
            @image-drop="handleImageDropped"
            @image-restore="handleImageRestore"
          />
        </div>
        <div class="layout__common-side">
          <TacticalBoardPanel />
        </div>
      </div>
    </div>
    <div class="layout__side layout__side--right">
      <TeamInfo
        team="lumine"
        v-model="teamInfoMap.lumine"
        @update:modelValue="(val: TeamInfoModel) => updateTeam('lumine', val)"
      />
      <PickZone
        :zones="pickZones.right"
        side="right"
        :imageMap="props.imageMap"
        @image-drop="handleImageDropped"
        @image-restore="handleImageRestore"
      />
    </div>
  </div>
</template>

<style scoped>
.layout__main {
  /* background: rgba(0, 255, 0, 0.1); */
  min-height: 200px;
}

.layout__main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  /* justify-content: space-between; */
  justify-content: center;
}

.layout__side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.layout__center {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.layout__ban-zone {
  position: relative;
  display: flex;
  align-items: center;
}

.layout__common {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: start;
  gap: 10px;
}

.layout__common-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 500px;
}

.layout__utility-zone {
  display: flex;
  flex-direction: column;
  justify-self: center;
  align-items: center;
  gap: 25px;
}

.layout__step-indicator {
  display: flex;
  width: 330px;
  height: 100px;
  align-items: center;
  justify-content: center;
}
</style>
