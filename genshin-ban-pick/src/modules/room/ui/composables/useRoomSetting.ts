// src/modules/room/ui/composables/useRoomSetting.ts
import { reactive, ref } from 'vue';
import { roomUseCase } from '../../application/roomUseCase';

export function useRoomSetting() {
    const { buildRoom } = roomUseCase();

    const form = reactive({
        roomId: 'default-room',
        numberOfUtility: 3,
        numberOfBan: 6,
        numberOfPick: 32,
    });

    const isLoading = ref(false);
    const errorMessage = ref('');

    async function submit() {
        isLoading.value = true;
        errorMessage.value = '';

        try {
            await buildRoom(form.roomId, {
                numberOfUtility: form.numberOfUtility,
                numberOfBan: form.numberOfBan,
                numberOfPick: form.numberOfPick,
            });

            return true; // success
        } catch (err: any) {
            errorMessage.value = err.response?.data?.message || '建立房間失敗';
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        form,
        isLoading,
        errorMessage,
        submit,
    };
}
