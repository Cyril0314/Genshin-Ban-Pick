import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true, // 如果後端需要帶 cookie
})

export default api

export async function registerUser(payload: {
  account: string
  password: string
  nickname: string
}) {
  return api.post('/api/auth/register', payload)
}

export async function loginUser(payload: { account: string; password: string }) {
  return api.post('/auth/login', payload)
}
