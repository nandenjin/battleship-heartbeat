import { createRouter, createWebHistory } from 'vue-router'
import Index from './Index.vue'
import Admin from './Admin.vue'
import Player from './Player.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Index,
    },
    {
      path: '/admin',
      component: Admin,
    },
    {
      path: '/:id',
      component: Player,
    },
  ],
})
