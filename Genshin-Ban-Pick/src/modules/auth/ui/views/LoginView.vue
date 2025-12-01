<!-- src/views/LoginPage.vue -->

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useSocketStore } from '@/app/stores/socketStore';
import { useAuthUseCase } from '../composables/useAuthUseCase';

const router = useRouter();
const authUseCase = useAuthUseCase();
const socketStore = useSocketStore();

const accountInput = ref('');
const passwordInput = ref('');

async function handleLoginMemberSubmit() {
    try {
        const { token } = await authUseCase.loginMember(accountInput.value, passwordInput.value);
        socketStore.connect(token);
        router.push(`/room-list`);
    } catch (error: any) {
        alert(`${error.response?.data?.message || '登入失敗，請確認帳密'}`);
    }
}

async function handleLoginGuestButtonClick() {
    try {
        const { token } = await authUseCase.loginGuest();
        socketStore.connect(token);
        router.push(`/room-list`);
    } catch (error: any) {
        alert(`${error.response?.data?.message || '登入失敗，請確認帳密'}`);
    }
}
</script>

<template>
    <div class="login__view scale-context">
        <div class="side__bar">
            <div class="login__card">
                <div class="login__header">
                    <h2>使用者登入</h2>
                </div>
                <form class="login__form" @submit.prevent="handleLoginMemberSubmit">
                    <div class="form__group">
                        <label for="account">帳號</label>
                        <input id="account" v-model="accountInput" type="text" placeholder="請輸入帳號" required />
                    </div>

                    <div class="form__group">
                        <label for="password">密碼</label>
                        <input id="password" v-model="passwordInput" type="password" placeholder="請輸入密碼" required />
                    </div>
                    <div class="layout__actions">
                        <button type="submit" class="btn__submit">登入</button>

                        <RouterLink to="/register" class="redirect__link">註冊</RouterLink>

                        <button class="btn__guest" @click="handleLoginGuestButtonClick">以訪客身份繼續</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login__view {
    --base-size: 1.6vw;
    --size-card-lg: calc(var(--base-size) * 16);
    display: flex;
    justify-content: end;
    height: 100vh;
    background:
        linear-gradient(to right, rgba(var(--md-sys-color-background-rgb) / 0.1) 10%, rgba(var(--md-sys-color-background-rgb) / 0.9) 65%),
        url('@/assets/images/background/background.jpg') no-repeat center center;
    background-size: cover;
}

.side__bar {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--space-lg);
    backdrop-filter: blur(12px) saturate(160%);
}

.login__card {
    display: flex;
    flex-direction: column;
    width: var(--size-card-lg);
    padding: var(--space-lg);
    gap: var(--space-lg);
}

.login__header h2 {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    text-align: center;
    line-height: var(--line-height-loosest);
    color: var(--md-sys-color-on-surface);
}

/* 表單整體間距 */
.login__form {
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
    border: none;
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

.btn__guest {
    background-color: transparent;
    border: none;
    color: var(--md-sys-color-on-surface-variant);
    border-radius: var(--radius-md);
    border: none;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-regular);
    cursor: pointer;
    transition:
        color 0.2s ease,
        transform 0.2s ease;
}

.btn__guest:hover {
    color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 90%, white 10%);
    transform: scale(1.02);
}
</style>
