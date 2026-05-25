<!-- src/views/RegisterView.vue -->

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { createLogger } from '@/app/utils/logger';
import { useSocketStore } from '@/app/stores/socketStore';
import { useAuthStore } from '../../store/authStore';
import { useAuthUseCase } from '../composables/useAuthUseCase';
import { useUserUseCase } from '@/modules/user/ui/composables/useUserUseCase';

const logger = createLogger('auth.ui.register');
const router = useRouter();
const authUseCase = useAuthUseCase();
const userUseCase = useUserUseCase();
const authStore = useAuthStore();
const socketStore = useSocketStore();

const accountInput = ref('');
const nicknameInput = ref('');
const passwordInput = ref('');
const confirmPasswordInput = ref('');

async function handleRegisterMemberSubmit() {
    if (passwordInput.value !== confirmPasswordInput.value) {
        logger.warn('password mismatch');
        alert('密碼不一致');
        return;
    }
    logger.debug('register submit', accountInput.value);
    try {
        await authUseCase.registerMember(accountInput.value, passwordInput.value, nicknameInput.value);
        logger.debug('register ok, connecting socket');
        const token = authStore.getToken();
        if (!token) { logger.error('register ok but token missing'); return; }
        socketStore.connect(token);
        await userUseCase.fetchProfile();
        router.push(`/room-list`);
    } catch (error: any) {
        logger.error('register failed', error);
        alert(`${error.response?.data?.message || '註冊失敗'}`);
    }
}
</script>

<template>
    <div class="register-view scale-context">
        <div class="sidebar">
            <div class="card">
                <div class="header">
                    <h2>創建新帳號</h2>
                </div>
                <form class="form" @submit.prevent="handleRegisterMemberSubmit">
                    <div class="form-group">
                        <label for="account">帳號</label>
                        <input id="account" v-model="accountInput" type="text" placeholder="請輸入帳號" required />
                    </div>

                    <div class="form-group">
                        <label for="nickname">暱稱</label>
                        <input id="nickname" v-model="nicknameInput" type="text" placeholder="請輸入暱稱" required />
                    </div>

                    <div class="form-group">
                        <label for="password">密碼</label>
                        <input id="password" v-model="passwordInput" type="password" placeholder="請輸入密碼" required />
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">確認密碼</label>
                        <input id="confirmPassword" v-model="confirmPasswordInput" type="password" placeholder="再次輸入密碼" required />
                    </div>
                    <div class="actions">
                        <button type="submit" class="submit-button">註冊</button>
                        <p class="redirect-text">
                            已有帳號？
                            <RouterLink to="/login" class="login-link">前往登入</RouterLink>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.register-view {
    --base-size: 1.6vw;
    --size-card-lg: calc(var(--base-size) * 16);
    display: flex;
    justify-content: end;
    height: 100vh;
    background:
        linear-gradient(to right, rgba(var(--md-sys-color-background-rgb) / 0.1) 10%, rgba(var(--md-sys-color-background-rgb) / 0.9) 65%),
        url('@/assets/images/background/wallpaper4.jpg') no-repeat right;
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

.redirect-text {
    text-align: center;
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
}

.login-link {
    color: var(--md-sys-color-on-surface);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
    transition:
        color 0.2s ease,
        transform 0.2s ease;
}

.login-link:hover {
    color: color-mix(in srgb, var(--md-sys-color-on-surface) 90%, white 10%);
    transform: scale(1.02);
}
</style>
