import { createRouter, createWebHistory } from 'vue-router'

import BanPickView from '../views/BanPickView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import RoomSettingView from '@/views/RoomSettingView.vue'
import RoomListView from '@/views/RoomListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/ban-pick',
      name: 'BanPick',
      component: BanPickView,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterView,
    },
    {
      path: '/room-setting',
      name: 'RoomSetting',
      component: RoomSettingView,
    },
    {
      path: '/room-list',
      name: 'RoomList',
      component: RoomListView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../playground/views/AboutView.vue'),
    },
  ],
})

export default router
