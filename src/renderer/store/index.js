import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    exporting: false
  },
  mutations: {
    changeExportState(state, payload) {
      state.exporting = payload.exporting
    }
  },
  actions: {
  },
  modules: {
  }
})
