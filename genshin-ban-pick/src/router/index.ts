import { createRouter, createWebHistory } from 'vue-router'
import BanPickView from '../views/BanPickView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'ban-pick',
      component: BanPickView,
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
