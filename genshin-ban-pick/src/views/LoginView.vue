<!-- src/views/LoginPage.vue -->

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '../network/authService'

const account = ref('')
const password = ref('')
const router = useRouter()

async function handleLogin() {
  try {
    await loginUser({ account: account.value, password: password.value })
    router.push('/') // 登入成功後導回首頁或大廳
  } catch (error) {
    alert('登入失敗，請確認帳密')
  }
}
</script>
<template>
  <div class="auth-view">
    <h2>登入</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="account" placeholder="帳號" required />
      <input v-model="password" type="password" placeholder="密碼" required />
      <button type="submit">登入</button>
    </form>
    <p>
      還沒有帳號？
      <RouterLink to="/register">註冊</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.auth-view {
  max-width: 400px;
  margin: auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
