import axios from 'axios'

import { TokenNotFound } from '@/errors/AppError'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // 如果後端需要帶 cookie
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token && config.headers?.set) {
    config.headers?.set?.('Authorization', `Bearer ${token}`)
  } else {
    console.error(`[AUTH SERVICE] Token is nil`)
  }
  return config
})

export default api

export async function registerUser(payload: {
  account: string
  password: string
  nickname: string
}) {
  return api.post('/auth/register', payload)
}

export async function loginUser(payload: { account: string; password: string }) {
  return api.post('/auth/login', payload)
}

export async function getCurrentUser() {
  const token = localStorage.getItem('auth_token')
  if (!token) throw new TokenNotFound()
  return api.get('/auth/me')
}
