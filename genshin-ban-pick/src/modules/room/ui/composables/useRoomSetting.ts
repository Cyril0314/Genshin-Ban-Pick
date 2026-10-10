// src/modules/room/ui/composables/useRoomSetting.ts

import { alignZoneCountToRounds, deriveNumberOfTeamSetup } from '@shared/contracts/room/roomSettingRules';
import { computed, reactive, ref } from 'vue';

import { createLogger } from '@/app/utils/logger';

import { useRoomUseCase } from './useRoomUseCase';

const logger = createLogger('room.ui.roomSetting');

// 一組陣容的角色數（原神一隊 4 人）。不開放填寫，但要送給後端，前後端才用同一個數字對齊 Pick
const NUMBER_OF_SETUP_CHARACTER = 4;

const isPositiveInteger = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 1;

export function useRoomSetting() {
    const roomUseCase = useRoomUseCase();

    // 房主實際打的數字。Ban/Pick 不直接存對齊後的值，否則 2→3→2 回合會卡在補上去的大數退不回來
    const base = reactive({
        totalRounds: 2,
        numberOfBan: 8,
        numberOfPick: 32,
    });

    const hasValidRounds = computed(() => isPositiveInteger(base.totalRounds));

    // 對齊規則只在回合數有效時套用；輸入框清空時 v-model 給空字串，直接算會變 NaN
    function alignBan(count: number) {
        return hasValidRounds.value ? alignZoneCountToRounds(count, base.totalRounds) : count;
    }
    function alignPick(count: number) {
        return hasValidRounds.value ? alignZoneCountToRounds(count, base.totalRounds, NUMBER_OF_SETUP_CHARACTER) : count;
    }

    // 表單欄位：讀出對齊後的值（房主看到的就是會建出的數字），寫入時更新 base
    const form = reactive({
        roomId: 'default-room',
        totalRounds: computed({
            get: () => base.totalRounds,
            set: (value: number) => (base.totalRounds = value),
        }),
        numberOfUtility: 4,
        numberOfBan: computed({
            get: () => alignBan(base.numberOfBan),
            set: (value: number) => (base.numberOfBan = value),
        }),
        numberOfPick: computed({
            get: () => alignPick(base.numberOfPick),
            set: (value: number) => (base.numberOfPick = value),
        }),
    });

    // 給 input 的 step：Ban 每回合兩隊各半；Pick 另外還要排得滿整組陣容
    const banCountStep = computed(() => alignBan(1));
    const pickCountStep = computed(() => alignPick(1));
    // 陣容組數跟著 Pick 數走，給房主看會建出幾組陣容；回合數無效時沒有意義
    const numberOfTeamSetup = computed(() => (hasValidRounds.value ? deriveNumberOfTeamSetup(form.numberOfPick, NUMBER_OF_SETUP_CHARACTER) : undefined));

    const isLoading = ref(false);
    const errorMessage = ref('');

    async function submit() {
        logger.debug('submit room setting', {
            roomId: form.roomId,
            totalRounds: form.totalRounds,
            numberOfUtility: form.numberOfUtility,
            numberOfBan: form.numberOfBan,
            numberOfPick: form.numberOfPick,
        });
        isLoading.value = true;
        errorMessage.value = '';

        try {
            await roomUseCase.buildRoom(form.roomId, {
                totalRounds: form.totalRounds,
                numberOfUtility: form.numberOfUtility,
                numberOfBan: form.numberOfBan,
                numberOfPick: form.numberOfPick,
                numberOfSetupCharacter: NUMBER_OF_SETUP_CHARACTER,
            });

            logger.debug('room built ok', form.roomId);
            return true; // success
        } catch (err: any) {
            logger.error('build room failed', err);
            errorMessage.value = err.response?.data?.message || '建立房間失敗';
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        form,
        banCountStep,
        pickCountStep,
        numberOfTeamSetup,
        isLoading,
        errorMessage,
        submit,
    };
}
