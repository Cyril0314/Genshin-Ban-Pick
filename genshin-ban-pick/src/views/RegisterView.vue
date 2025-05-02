<!-- src/views/RegisterView.vue -->

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { registerUser } from '../network/authService'
import { useRouter } from 'vue-router'

const router = useRouter()

const account = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '密碼不一致'
    return
  }

  try {
    await registerUser({
      account: account.value,
      password: password.value,
      nickname: nickname.value,
    })
    router.push('/login') // 成功後導向登入頁
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || '註冊失敗'
  }
}
</script>

<template>
  <div class="register-view">
    <h2>註冊帳號</h2>
    <form class="register-form" @submit.prevent="handleRegister">
      <input v-model="account" placeholder="帳號" required />
      <input v-model="nickname" placeholder="暱稱" required />
      <input v-model="password" type="password" placeholder="密碼" required />
      <input v-model="confirmPassword" type="password" placeholder="確認密碼" required />
      <button type="submit">註冊</button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p class="hint">已有帳號？<a href="/login">前往登入</a></p>
  </div>
</template>

<style scoped>
.register-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 48px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 280px;
}

input {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  padding: 10px;
  background-color: #4e4040;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #6b5b5b;
}

.error {
  color: red;
  font-size: 14px;
}

.hint {
  font-size: 13px;
  color: #666;
}
</style>
