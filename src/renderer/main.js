import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/main.scss'
import '@fortawesome/fontawesome-free/css/all.min.css'
import devConfig from '@framework/config/devConfig.json'
import proConfig from '@framework/config/proConfig.json'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

if (process.env.NODE_ENV === 'production') {
  Vue.prototype['$config'] = Object.freeze(proConfig)
} else {
  Vue.prototype['$config'] = Object.freeze(devConfig)
}

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueVirtualScroller)
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
