<!-- src/views/LoginPage.vue -->

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '../network/authService'
import { useAuth } from '../composables/useAuth'

const account = ref('')
const password = ref('')
const router = useRouter()
const { proceedAsGuest, login } = useAuth()

async function handleLogin() {
  try {
    const response = await loginUser({ account: account.value, password: password.value })
    const { id, account: userAccount, nickname, token } = response.data
    login({ id, account: userAccount, nickname }, token)
    router.push('/')
  } catch (error) {
    alert('登入失敗，請確認帳密')
  }
}

function handleProceedAsGuest() {
  proceedAsGuest()
  router.push('/')
}
</script>

<template>
  <div class="login__view">
    <div class="login__card">
      <div class="login__header">
        <h2>使用者登入</h2>
      </div>
      <form class="login__form" @submit.prevent="handleLogin">
        <div class="form__group">
          <label for="account">帳號</label>
          <input id="account" v-model="account" type="text" placeholder="請輸入帳號" required />
        </div>

        <div class="form__group">
          <label for="password">密碼</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="請輸入密碼"
            required
          />
        </div>

        <button type="submit" class="btn__submit">登入</button>
      </form>

      <div class="alternative__actions">
        <button class="btn__guest" @click="handleProceedAsGuest">以訪客身份繼續</button>
        <p class="redirect__text">
          還沒有帳號？
          <RouterLink to="/register" class="redirect__link">前往註冊</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 容器置中，並使用 Chat 風格背景 */
.login__view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background:
    linear-gradient(
      var(--md-sys-color-surface-container-lowest-alpha),
      var(--md-sys-color-surface-container-lowest-alpha)
    ),
    url('@/assets/images/background/wallpaper4.jpg') no-repeat center center;
  background-size: cover;
}

/* 卡片風格：圓角、陰影、內邊距 */
.login__card {
  width: 100%;
  max-width: 360px;
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
.login__header h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
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

/* 登入按鈕風格與 Chat 傳送按鈕保持一致：深色背景、白字、圓角 */
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

/* 其他操作：前往註冊與以訪客身份繼續 */
.alternative__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  align-items: center;
}

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

/* 訪客按鈕風格 */
.btn__guest {
  width: 100%;
  padding: var(--space-md);
  background-color: var(--md-sys-color-secondary);
  color: var(--md-sys-color-on-secondary);
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.btn__guest:hover {
  background-color: var(--md-sys-color-secondary-container);
  transform: scale(1.02);
}
</style>
