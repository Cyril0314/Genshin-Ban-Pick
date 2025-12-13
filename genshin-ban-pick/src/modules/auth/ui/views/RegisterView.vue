<!-- src/views/RegisterView.vue -->

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useSocketStore } from '@/app/stores/socketStore';
import { useAuthUseCase } from '../composables/useAuthUseCase';

const router = useRouter();
const authUseCase = useAuthUseCase();
const socketStore = useSocketStore();

const accountInput = ref('');
const nicknameInput = ref('');
const passwordInput = ref('');
const confirmPasswordInput = ref('');

async function handleRegisterMemberSubmit() {
    if (passwordInput.value !== confirmPasswordInput.value) {
        alert('密碼不一致');
        return;
    }
    try {
        const { token } = await authUseCase.registerMember(accountInput.value, passwordInput.value, nicknameInput.value);
        socketStore.connect(token);
        router.push(`/room-list`);
    } catch (error: any) {
        alert(`${error.response?.data?.message || '註冊失敗'}`);
    }
}
</script>

<template>
    <div class="register__view scale-context">
        <div class="side__bar">
            <div class="register__card">
                <div class="register__header">
                    <h2>創建新帳號</h2>
                </div>
                <form class="register__form" @submit.prevent="handleRegisterMemberSubmit">
                    <div class="form__group">
                        <label for="account">帳號</label>
                        <input id="account" v-model="accountInput" type="text" placeholder="請輸入帳號" required />
                    </div>

                    <div class="form__group">
                        <label for="nickname">暱稱</label>
                        <input id="nickname" v-model="nicknameInput" type="text" placeholder="請輸入暱稱" required />
                    </div>

                    <div class="form__group">
                        <label for="password">密碼</label>
                        <input id="password" v-model="passwordInput" type="password" placeholder="請輸入密碼" required />
                    </div>

                    <div class="form__group">
                        <label for="confirmPassword">確認密碼</label>
                        <input id="confirmPassword" v-model="confirmPasswordInput" type="password" placeholder="再次輸入密碼" required />
                    </div>
                    <div class="layout__actions">
                        <button type="submit" class="btn__submit">註冊</button>
                        <p class="redirect__text">
                            已有帳號？
                            <RouterLink to="/login" class="redirect__link">前往登入</RouterLink>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.register__view {
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

.side__bar {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--space-lg);
    backdrop-filter: blur(12px) saturate(160%);
}

.register__card {
    display: flex;
    flex-direction: column;
    width: var(--size-card-lg);
    padding: var(--space-lg);
    gap: var(--space-lg);
}

.register__header h2 {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    text-align: center;
    line-height: var(--line-height-loosest);
    color: var(--md-sys-color-on-surface);
}

/* 表單整體間距 */
.register__form {
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
    outline: 1px solid color-mix(in srgb, var(--md-sys-color-on-surface-variant) 20%, white 80%);
}

.layout__actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

/* 註冊按鈕風格與 Chat 傳送按鈕保持一致：深色背景、白字、圓角 */
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

/* 下方註冊成功後導向文字 */
.redirect__text {
    text-align: center;
    font-size: var(--font-size-sm);
    color: var(--md-sys-color-on-surface-variant);
}

.redirect__link {
    color: var(--md-sys-color-on-surface);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
    transition:
        color 0.2s ease,
        transform 0.2s ease;
}

.redirect__link:hover {
    color: color-mix(in srgb, var(--md-sys-color-on-surface) 90%, white 10%);
    transform: scale(1.02);
}
</style>
