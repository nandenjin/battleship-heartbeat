import { createRouter, createWebHistory } from 'vue-router'
import Index from './Index.vue'
import Player from './Player.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Index,
    },
    {
      path: '/:id',
      component: Player,
    },
  ],
})
