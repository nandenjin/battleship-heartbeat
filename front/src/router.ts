import { createRouter, createWebHistory } from 'vue-router'
import Player from './Player.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/:id',
      component: Player,
    },
  ],
})
