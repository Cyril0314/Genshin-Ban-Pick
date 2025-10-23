<!-- src/views/RegisterView.vue -->

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { registerUser } from '../network/authService';

const router = useRouter();

const account = ref('');
const nickname = ref('');
const password = ref('');
const confirmPassword = ref('');

async function handleRegister() {
    if (password.value !== confirmPassword.value) {
        alert('密碼不一致');
        return;
    }

    try {
        await registerUser({
            account: account.value,
            password: password.value,
            nickname: nickname.value,
        });
        router.push('/login'); // 成功後導向登入頁
    } catch (error: any) {
        alert(`${error.response?.data?.message || '註冊失敗'}`);
    }
}
</script>

<template>
    <div class="register__view">
        <div class="register__card">
            <div class="register__header">
                <h2>創建新帳號</h2>
            </div>
            <form class="register__form" @submit.prevent="handleRegister">
                <div class="form__group">
                    <label for="account">帳號</label>
                    <input id="account" v-model="account" type="text" placeholder="請輸入帳號" required />
                </div>

                <div class="form__group">
                    <label for="nickname">暱稱</label>
                    <input id="nickname" v-model="nickname" type="text" placeholder="請輸入暱稱" required />
                </div>

                <div class="form__group">
                    <label for="password">密碼</label>
                    <input id="password" v-model="password" type="password" placeholder="請輸入密碼" required />
                </div>

                <div class="form__group">
                    <label for="confirmPassword">確認密碼</label>
                    <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="再次輸入密碼" required />
                </div>

                <button type="submit" class="btn__submit">註冊</button>
            </form>

            <p class="redirect__text">
                已有帳號？
                <RouterLink to="/login" class="redirect__link">前往登入</RouterLink>
            </p>
        </div>
    </div>
</template>

<style scoped>
/* 容器置中，並使用 Chat 風格背景 */
.register__view {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background:
        linear-gradient(var(--md-sys-color-surface-container-lowest-alpha), var(--md-sys-color-surface-container-lowest-alpha)),
        url('@/assets/images/background/5.7.png') no-repeat center center;
    background-size: cover;
}

/* 卡片風格：圓角、陰影、內邊距 */
.register__card {
    width: 100%;
    max-width: var(--size-card-xl);
    background-color: var(--md-sys-color-surface-container-highest-alpha);
    backdrop-filter: var(--backdrop-filter);
    border-radius: var(--border-radius-md);
    box-shadow: var(--box-shadow);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

/* 標題置中，字體顏色與 Chat 風格一致 */
.register__header h2 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    text-align: center;
    color: var(--md-sys-color-on-surface-variant);
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

/* Label 使用深色文字 */
.form__group label {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--md-sys-color-on-surface-variant);
}

/* Input 欄位風格類似聊天輸入框：圓角、內間距、背景半透明 */
.form__group input {
    padding: var(--space-md);
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--md-sys-color-on-surface-variant);
    background-color: var(--md-sys-color-surface-container-lowest-alpha);
    color: var(--md-sys-color-on-surface);
    font-size: var(--font-size-lg);
    outline: none;
}

.form__group input::placeholder {
    color: var(--md-sys-color-on-surface-variant);
}

.form__group input:focus {
    border-color: var(--md-sys-color-primary);
    box-shadow: var(--box-shadow);
}

/* 註冊按鈕風格與 Chat 傳送按鈕保持一致：深色背景、白字、圓角 */
.btn__submit {
    padding: var(--space-md);
    background-color: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border: none;
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    transition:
        background-color 0.2s ease,
        transform 0.2s ease;
}

.btn__submit:hover {
    background-color: var(--md-sys-color-primary-container);
    transform: scale(1.02);
}

/* 下方註冊成功後導向文字 */
.redirect__text {
    text-align: center;
    font-size: var(--font-size-lg);
    color: var(--md-sys-color-on-surface-variant);
}

.redirect__link {
    color: var(--md-sys-color-primary);
    text-decoration: none;
    font-weight: var(--font-weight-medium);
    transition: color 0.2s ease;
}

.redirect__link:hover {
    color: var(--md-sys-color-primary-container);
}
</style>
