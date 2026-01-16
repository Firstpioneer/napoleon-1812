import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue')
  },
  {
    path: '/visualization',
    name: 'Visualization',
    component: () => import('../views/VisualizationPage.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardPage.vue')
  },
  {
    path: '/reading',
    name: 'Reading',
    component: () => import('../views/ReadingPage.vue')
  },
  {
    path: '/battle/:id',
    name: 'BattleDetail',
    component: () => import('../views/BattleDetailPage.vue')
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('../views/GamePage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
