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
.layout-container {
  position: fixed;
  top: 56px;
  left: 0;
  width: 100%;
  height: calc(100% - 56px);
}

.layout-header {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
  height: 56px;
  background: linear-gradient(to right, #6246ea 0%, #1c4ddf 80%);
  -webkit-app-region: drag;

  a {
    text-underline: none;
  }

  a:-webkit-any-link {
    text-decoration: none;
  }

  .left {
    position: absolute;
    top: 0;
    left: 0;
    height: 56px;
    width: 200px;

    .layout-logo {
      position: relative;
      display: inline-block;
      margin: 8px 4px 8px 15px;
      width: 40px;
      height: 40px;
      border-radius: 6px;
      background-color: rgba(255, 255, 255, .15);

      &:after {
        content: '';
        position: absolute;
        top: 8px;
        left: 8px;
        width: 24px;
        height: 24px;
        background-image: url("../assets/img/logo.png");
        background-size: 24px 24px;
      }
    }

    span {
      display: inline-block;
      padding-top: 14px;
      font-size: 15px;
      font-weight: bolder;
      line-height: 16px;
      color: rgba(255, 255, 255, .8);
      vertical-align: top;

      small {
        padding-left: 2px;
        font-size: 12px;
        font-weight: lighter;
      }
    }
  }

  .header-menu {
    position: absolute;
    top: 0;
    //left: 200px;
    left: 180px;
    border-right: 0;
    background-color: transparent;
    -webkit-app-region: no-drag;

    .el-menu-item {
      position: relative;
      float: left;
      display: inline-block;
      height: 56px;
      line-height: 56px;

      &:hover,
      &:focus {
        background-color: #2f0992;
      }

      i {
        width: 20px;
        color: inherit;
      }

      &.is-active:after {
        content: '';
        display: block;
        width: 0;
        height: 0;
        border-width: 0 6px 5px;
        border-style: solid;
        border-color: transparent transparent #f1f2f3;
        position: absolute;
        bottom: 0;
        left: 48%;
      }
    }
  }

  .layout-tools {
    position: absolute;
    right: 0;
    top: 0;
    display: inline-block;
  }
}
</style>