<template>
  <lay-out>
    <el-aside width='360px' class='left-aside'>
      <ui-card>
        <div class='custom-flex' style='position: fixed;z-index: 2;top: 100px;'>
          <el-input v-model.trim='value' clearable placeholder='请输入内容' style='margin-right: 18px;' />
          <el-tooltip effect='dark' content='定位小区' placement='top-start'>
            <el-button type='plain' class='fas fa-search-location' circle size='mini' @click='searchCity'
                       :disabled='value.length === 0' />
          </el-tooltip>
          <el-tooltip effect='dark' content='导出文件' placement='top-start'>
            <el-button type='plain' class='fas fa-file-export' circle size='mini' @click='exportFile'
                       :disabled='coordinatesList.length === 0' />
          </el-tooltip>
        </div>
        <div style='user-select: text;margin-top: 60px;'>
          <el-table
            :data='coordinatesList'
            border
            max-height='520'
            v-loading='searching'
          >
            <el-table-column
              header-align='center'
              label='范围坐标(WGS-84)'
            >
              <template v-slot='{row}'>
                经度: {{ row[0] }}
                <br />
                维度: {{ row[1] }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </ui-card>
    </el-aside>
    <el-main>
      <div id='container' style='width:100%;height:100%;'></div>
    </el-main>
  </lay-out>
</template>

<script>
import { ipcRenderer } from 'electron'
import LayOut from '@/components/LayOut'
import { Conversion } from '@framework/utils'
import axios from 'axios'
import _ from 'lodash/throttle'
import UiCard from '@/components/UiCard'

export default {
  name: 'Main',
  components: { UiCard, LayOut },
  data() {
    return {
      value: '',
      map: null,
      coordinatesList: [],
      searching: false,
    }
  },
  mounted() {
    this.map = new BMap.Map('container')
    this.map.centerAndZoom('航空科技大厦', 20)
    this.map.enableScrollWheelZoom(true)
  },
  methods: {
    //定位区域
    searchCity: _(function() {
      this.coordinatesList = []
      this.searching = true
      const local = new BMap.LocalSearch(this.map, {
        renderOptions: { map: this.map, panel: 'result' },
        onSearchComplete: (results) => {
          if (local.getStatus() === BMAP_STATUS_SUCCESS && results.getPoi(0)) {
            let { uid } = results.getPoi(0)
            if (uid) return this.queryUid(uid)
          }
          this.searching = false
          return this.$message.error('无搜索目标,请查证后再试!!！')
        },
        pageCapacity: 1,
      })
      local.search(this.value)
    }, 800),
    //获取小区信息
    async queryUid(uid) {
      try {
        let url = `https://map.baidu.com/?reqflag=pcmap&from=webmap&qt=ext&uid=${uid}&ext_ver=new&l=18`
        const result = await axios.get(url)
        let content = result.data.content
        if (content.hasOwnProperty('geo') && content.geo) {
          const { wgsArr, polygonArr } = this.coordinateToPoints(content.geo)
          // 地图绘制范围 创建多边形
          const polygon = new BMap.Polyline(polygonArr, {
            strokeColor: 'blue',
            strokeWeight: 3,
            strokeOpacity: 0.5,
          })
          this.map.clearOverlays()
          this.map.addOverlay(polygon)
          this.coordinatesList = wgsArr
          this.map.setViewport(polygon.getPath())
          return this.$message.success(`${this.value} 查询成功`)
        }
        this.map.clearOverlays()
        this.$message.error(`${this.value}  无范围点覆盖，无法导出`)
      } catch (e) {
        this.$message.error(`百度API搜索出错，请稍后再试！`)
      } finally {
        this.searching = false
      }
    },
    //坐标转换
    coordinateToPoints(coordinate) {
      if (coordinate && coordinate.indexOf('-') >= 0) {
        const wgsArr = []
        const polygonArr = []
        const projection = BMAP_NORMAL_MAP.getProjection()
        let tempco = coordinate.split('-')[1]
        if (tempco && tempco.indexOf(',') >= 0) {
          tempco = tempco.replace(';', '').split(',')
          //分割点，两个一组，组成百度米制坐标
          //遍历米制坐标，转换为经纬度
          for (let i = 0, len = tempco.length; i < len; i++) {
            let point = projection.pointToLngLat(new BMap.Pixel(tempco[i], tempco[i + 1]))
            wgsArr.push(Conversion.BaiduToWgs84(point.lng, point.lat))
            polygonArr.push(new BMap.Point(point.lng, point.lat))
            i++
          }
          return {
            wgsArr,
            polygonArr,
          }
        }
      }
      this.$message.error(`百度API搜索出错，请稍后再试！`)
    },
    async exportFile() {
      try {
        const result = await ipcRenderer.invoke('exportSingleFile', JSON.stringify({
          title: this.value,
          geo: this.coordinatesList,
        }))
        if (!result) return
        this.$message.success(`${this.value}.kml 导出成功`)
        this.value = ''
        this.coordinatesList = []
        this.map.clearOverlays()
      } catch (e) {
        this.$message.error('导出失败,请稍后再试~！')
      }
    },
  },
  beforeDestroy() {
    this.map = null
    this.coordinatesList = []
  },
}
</script>

<style scoped lang='scss'>
.el-input {
  width: 210px;
}
</style>