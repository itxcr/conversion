import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (to) {
  return VueRouterPush.call(this, to).catch(err => err)
}
const routes = [
  {
    path: '/main',
    name: 'main',
    component: require('@/views/Main').default,
    meta: {
      menuActive: 1,
    },
  },
]

const router = new VueRouter({
  routes,
})

export default router
