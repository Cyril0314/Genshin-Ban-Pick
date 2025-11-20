<!-- src/modules/room/ui/views/RoomSettingView.vue -->

<script setup lang="ts">
import router from '@/router';
import { ref } from 'vue';

import { roomUseCase } from '../../application/roomUseCase';

const { buildRoom } = roomUseCase();

const roomIdInput = ref('default-room');
const numberOfUtilityInput = ref(3);
const numberOfBanInput = ref(6);
const numberOfPickInput = ref(32);

async function handleSubmit() {
    const rooId = roomIdInput.value;
    const numberOfUtility = numberOfUtilityInput.value;
    const numberOfBan = numberOfBanInput.value;
    const numberOfPick = numberOfPickInput.value;

    try {
        const roomSetting = await buildRoom(rooId, { numberOfUtility, numberOfBan, numberOfPick });
        // router.push(`/ban-pick?room=${rooId}`);
        router.push(`/login`);
    } catch (error: any) {
        alert(`${error.response?.data?.message || '建立房間失敗'}`);
    }
}
</script>

<template>
    <div class="room-setting__view scale-context">
        <div class="room-setting__card">
            <div class="room-setting__header">
                <h2>創建房間</h2>
            </div>
            <form class="room-setting__form" @submit.prevent="handleSubmit">
                <div class="form__group">
                    <label for="rooId">房間代號</label>
                    <input id="rooId" v-model="roomIdInput" type="text" placeholder="請輸入房間代號" required />
                </div>

                <div class="form__group">
                    <label for="numberOfUtility">自由位數量</label>
                    <input id="numberOfUtility" v-model="numberOfUtilityInput" type="number" placeholder="請輸入自由位數量" required />
                </div>

                <div class="form__group">
                    <label for="numberOfBan">Ban位數量</label>
                    <input id="numberOfBan" v-model="numberOfBanInput" type="number" placeholder="請輸入Ban位數量" required />
                </div>

                <div class="form__group">
                    <label for="numberOfPick">Pick位數量</label>
                    <input id="numberOfPick" v-model="numberOfPickInput" type="number" placeholder="請輸入Pick位數量" required />
                </div>

                <div class="layout__actions">
                    <button type="submit" class="btn__submit">創建</button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.room-setting__view {
    --size-card-lg: calc(var(--base-size) * 16);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--md-sys-color-background);
    background-size: cover;
}

.room-setting__card {
    display: flex;
    flex-direction: column;
    width: var(--size-card-lg);
    height: fit-content;
    padding: var(--space-lg);
    gap: var(--space-lg);
    background-color: var(--md-sys-color-surface-container);
    border-radius: var(--radius-lg);
}

.room-setting__header h2 {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    text-align: center;
    line-height: var(--line-height-loosest);
    color: var(--md-sys-color-on-surface);
}

/* 表單整體間距 */
.room-setting__form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

/* 每個欄位群組 */
.form__group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.form__group label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
}

.form__group input {
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    border: none;
    background-color: transparent;
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-sm);
    outline: 1px solid var(--md-sys-color-on-surface-variant);
}

.form__group input::placeholder {
    color: var(--md-sys-color-on-surface-variant);
}

.form__group input:focus {
    outline: 1px solid color-mix(in srgb, var(--md-sys-color-on-surface-variant) 80%, white 80%);
}

.layout__actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.btn__submit {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    border: none;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    transition:
        background-color 0.2s ease,
        transform 0.2s ease;
}

.btn__submit:hover {
    background-color: var(--primary-filled-hover);
    transform: scale(1.02);
}

.redirect__link {
    background-color: var(--md-sys-color-secondary);
    color: var(--md-sys-color-on-secondary);
    padding: var(--space-sm);
    text-decoration: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    text-align: center;
    transition:
        background-color 0.2s ease,
        transform 0.2s ease;
}

.redirect__link:hover {
    background-color: var(--secondary-filled-hover);
    transform: scale(1.02);
}
</style>
