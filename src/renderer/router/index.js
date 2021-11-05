import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Layout from '@/layout'

const routes = [
  {
    path: '/',
    component: Layout,
  },
  {
    path: '/change',
    component: () => import('@/views/change/Change'),
    name: 'Dashboard',
    meta: { title: '仪表盘', icon: 'dashboard', affix: true },
  },
  {
    path: '/test',
    component: () => import('@/views/dashboard/index'),
    name: 'Dashboard',
    meta: { title: '仪表盘', icon: 'dashboard', affix: true },
  },

]

const router = new VueRouter({
  routes,
})

export default router
