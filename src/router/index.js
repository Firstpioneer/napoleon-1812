import { createRouter, createWebHashHistory } from 'vue-router'

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
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（浏览器后退/前进），恢复到该位置
    if (savedPosition) {
      return savedPosition
    }
    // 否则滚动到顶部
    return { top: 0 }
  }
})

export default router
