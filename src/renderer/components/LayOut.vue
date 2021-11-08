<template>
  <div>
    <el-container class='layout-container'>
      <div class='layout-header'>
        <div class='left'>
          <div class='layout-logo'></div>
          <span>Conversion<br />
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
        <el-menu
          :default-active='menuActive'
          class='header-menu'
          text-color='#b9b6d3'
          active-text-color='#fff'
        >
          <router-link to='/main'>
            <el-menu-item index='1'>
              <i class="fas fa-map-marked-alt"></i>
              <span slot='title'>小区范围</span>
            </el-menu-item>
          </router-link>

        </el-menu>
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
      menuActive: '1',
    }
  },
  created() {
    ipcRenderer.on('window.status', (event, data) => {
      this.window_status = data.status
    })
  },
  mounted() {
    if (this.$route.meta.hasOwnProperty('menuActive')) {
      this.menuActive = String(this.$route.meta.menuActive)
    }
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

<style lang='scss' scoped>
.header-menu {
  -webkit-app-region: no-drag;
}

.index-user {
  padding: 10px 0;
  text-align: center;

  .name {
    display: block;
    margin-bottom: 5px;
    font-size: 15px;
    font-weight: bolder;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .email {
    display: block;
    font-size: 12px;
    color: #848a9c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.custom-type {
  background-color: #f9f9f9;
  padding: 5px;
  color: #848a9c;
  text-align: center;

  .type {
    font-size: 12px;
  }

  .num {
    font-size: 14px;

    .number {
      color: #242c43;
    }
  }
}

.img-center {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(1.2);
}

::v-deep .el-dialog__close {
  transform: scale(1.3);
}

.format {
  font-size: 18px;
  margin: 40px 0 30px 0;
  padding: 0 0 0 30px;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-right {
  display: flex;
  justify-content: flex-end;
}

h3 {
  margin: 0 0 8px 0;
  padding: 0;
}

.upFont {
  font-size: 16px;
  font-weight: 700;
}
</style>