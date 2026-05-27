<!-- src/modules/room/ui/views/RoomSettingView.vue -->

<script setup lang="ts">
import router from '@/router';
import { ref } from 'vue';
import { useRoomSetting } from '../composables/useRoomSetting';

const { form, isLoading, errorMessage, submit } = useRoomSetting();

async function handleSubmit() {
    const ok = await submit();
    if (ok) {
        router.push({ name: 'BanPick', query: { room: form.roomId } });
    }
}
</script>

<template>
    <div class="room-setting-view scale-context">
        <div class="card">
            <div class="header">
                <h2>創建房間</h2>
            </div>
            <form class="form" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="rooId">房間代號</label>
                    <input id="rooId" v-model="form.roomId" type="text" placeholder="請輸入房間代號" required />
                </div>

                <div class="form-group">
                    <label for="numberOfUtility">自由位數量</label>
                    <input id="numberOfUtility" v-model="form.numberOfUtility" type="number" placeholder="請輸入自由位數量"
                        required />
                </div>

                <div class="form-group">
                    <label for="numberOfBan">Ban位數量</label>
                    <input id="numberOfBan" v-model="form.numberOfBan" type="number" placeholder="請輸入Ban位數量" required />
                </div>

                <div class="form-group">
                    <label for="numberOfPick">Pick位數量</label>
                    <input id="numberOfPick" v-model="form.numberOfPick" type="number" placeholder="請輸入Pick位數量"
                        required />
                </div>

                <div class="actions">
                    <button type="submit" class="submit-button">創建</button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.room-setting-view {
    --base-size: 1.2vw;
    --size-card-lg: calc(var(--base-size) * 16);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: var(--md-sys-color-background);
    background-size: cover;
}

.card {
    display: flex;
    flex-direction: column;
    width: var(--size-card-lg);
    height: fit-content;
    padding: var(--space-lg);
    gap: var(--space-lg);
    background-color: var(--md-sys-color-surface-container);
    border-radius: var(--radius-lg);
}

.header h2 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    text-align: center;
    line-height: var(--line-height-loosest);
    color: var(--md-sys-color-on-surface);
}

.form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.form-group label {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
}

.form-group input {
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    border: none;
    background-color: transparent;
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-md);
    outline: 1px solid var(--md-sys-color-on-surface-variant);
}

.form-group input::placeholder {
    color: var(--md-sys-color-on-surface-variant);
}

.form-group input:focus {
    outline: 1px solid color-mix(in srgb, var(--md-sys-color-on-surface-variant) 20%, white 80%);
}

.actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.submit-button {
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    border: none;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    transition:
        background-color 0.2s ease,
        transform 0.2s ease;
}

.submit-button:hover {
    background-color: var(--primary-filled-hover);
    transform: scale(1.02);
}
</style>
