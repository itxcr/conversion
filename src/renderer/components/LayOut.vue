<template>
  <div>
    <el-container class='layout-container'>
      <div class='layout-header'>
        <div class='left'>
          <div class='layout-logo'></div>
          <span>百度地图获取kml<br />
            <small>V {{ version }} </small>
          </span>
        </div>
        <div class='layout-tools clearfix'>
          <el-button class='layout-tool-btn' @click='minimize'>
            <i class='layout_tools_ico layout_minimize'></i>
          </el-button>
          <el-button class='layout-tool-btn' @click='maximize'>
            <i class='layout_tools_ico layout_maximize' v-if="window_status === 'unmaximize'"></i>
            <i class='layout_tools_ico layout_restore' v-if="window_status === 'maximize'"></i>
          </el-button>
          <el-button class='layout-tool-btn layout_close' @click='close'>
            <i class='layout_tools_ico layout_close'></i>
          </el-button>
        </div>
      </div>
      <slot></slot>
    </el-container>
  </div>
</template>

<script>
import { Runtime } from '../../framework/runtime'
import { ipcRenderer } from 'electron'

export default {
  name: 'Layout',
  components: {},
  data() {
    return {
      version: Runtime.version(),
      window_status: 'unmaximize',
    }
  },
  created() {
    ipcRenderer.on('window.status', (event, data) => {
      this.window_status = data.status
    })
  },
  methods: {
    maximize() {
      ipcRenderer.invoke('window.maximize')
    },
    minimize() {
      ipcRenderer.invoke('window.minimize')
    },
    close() {
      ipcRenderer.invoke('window.destroy')
    },
  },
}
</script>

<style lang='scss'>
</style>