<!-- src/views/LoginPage.vue -->

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { createLogger } from '@/app/utils/logger';
import { useSession } from '@/app/composables/useSession';

const logger = createLogger('auth.ui.login');
const router = useRouter();
const session = useSession();

const accountInput = ref('');
const passwordInput = ref('');

async function handleLoginMemberSubmit() {
    logger.debug('member login submit');
    try {
        await session.loginMember(accountInput.value, passwordInput.value);
        router.push(`/room-list`);
    } catch (error: any) {
        logger.error('member login failed', error);
        alert(`${error.response?.data?.message || '登入失敗，請確認帳密'}`);
    }
}

async function handleLoginGuestButtonClick() {
    logger.debug('guest login');
    try {
        await session.loginGuest();
        router.push(`/room-list`);
    } catch (error: any) {
        logger.error('guest login failed', error);
        alert(`${error.response?.data?.message || '登入失敗，請確認帳密'}`);
    }
}
</script>

<template>
    <div class="login-view scale-context">
        <div class="sidebar">
            <div class="card">
                <div class="header">
                    <h2>使用者登入</h2>
                </div>
                <form class="form" @submit.prevent="handleLoginMemberSubmit">
                    <div class="form-group">
                        <label for="account">帳號</label>
                        <input id="account" v-model="accountInput" type="text" placeholder="請輸入帳號" required />
                    </div>

                    <div class="form-group">
                        <label for="password">密碼</label>
                        <input id="password" v-model="passwordInput" type="password" placeholder="請輸入密碼" required />
                    </div>
                    <div class="actions">
                        <button type="submit" class="submit-button">登入</button>

                        <RouterLink to="/register" class="register-link">註冊</RouterLink>

                        <button class="guest-button" @click="handleLoginGuestButtonClick">以訪客身份繼續</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-view {
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

.sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--space-lg);
    backdrop-filter: blur(12px) saturate(160%);
}

.card {
    display: flex;
    flex-direction: column;
    width: var(--size-card-lg);
    padding: var(--space-lg);
    gap: var(--space-lg);
}

.header h2 {
    font-size: var(--font-size-md);
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
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--md-sys-color-on-surface);
}

.form-group input {
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    border: none;
    background-color: transparent;
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-sm);
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
    font-size: var(--font-size-sm);
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

.register-link {
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

.register-link:hover {
    background-color: var(--secondary-filled-hover);
    transform: scale(1.02);
}

.guest-button {
    background-color: transparent;
    border: none;
    color: var(--md-sys-color-on-surface-variant);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-regular);
    cursor: pointer;
    transition:
        color 0.2s ease,
        transform 0.2s ease;
}

.guest-button:hover {
    color: color-mix(in srgb, var(--md-sys-color-on-surface-variant) 40%, white 60%);
    transform: scale(1.02);
}
</style>
