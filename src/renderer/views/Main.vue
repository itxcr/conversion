<template>
  <lay-out>
    <el-aside width='300px' class='left-aside'>
      <div class='custom-flex' style='position: fixed;z-index: 2;top: 100px;'>
        <el-input v-model.trim='value' clearable placeholder='请输入内容' style='margin-right: 10px;' />
        <el-tooltip effect='dark' content='定位小区' placement='top-start'>
          <el-button type='plain' class='fas fa-search-location' circle size='mini' @click='searchCity'
                     :disabled='value.length===0' />
        </el-tooltip>
        <el-tooltip effect='dark' content='导出文件' placement='top-start'>
          <el-button type='plain' class='fas fa-file-export' circle size='mini' @click='exportFile'
                     :disabled='tableData.length===0' />
        </el-tooltip>
      </div>
      <div style='user-select: text;margin-top: 80px;'>
        <!--        <DynamicScroller-->
        <!--          :items=tableData-->
        <!--          :min-item-size='70'-->
        <!--          class='scroller'>-->
        <!--          <template v-slot='{ item}'>-->
        <!--            经度: {{ item.lng }}-->
        <!--            <br />-->
        <!--            维度: {{ item.lat }}-->
        <!--            &lt;!&ndash;            <DynamicScrollerItem&ndash;&gt;-->
        <!--            &lt;!&ndash;            >&ndash;&gt;-->
        <!--            &lt;!&ndash;              {{ JSON.stringify(item) }}&ndash;&gt;-->
        <!--            &lt;!&ndash;              &lt;!&ndash;              <div class='text'>{{ item.size }}</div>&ndash;&gt;&ndash;&gt;-->
        <!--            &lt;!&ndash;            </DynamicScrollerItem>&ndash;&gt;-->
        <!--          </template>-->
        <!--        </DynamicScroller>-->

        <el-table
          :data='tableData'
          border
          max-height='400'
        >
          <el-table-column
            label='搜索目标范围坐标(WGS-84)'
          >
            <template v-slot='{row}'>
              经度: {{ row.lng }}
              <br />
              纬度: {{ row.lat }}
            </template>
          </el-table-column>
        </el-table>
      </div>
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
import { v4 as uuidV4 } from 'uuid'

export default {
  name: 'Main',
  inject: ['reload'],
  components: { LayOut },
  data() {
    return {
      value: '',
      map: null,
      coordinatesList: [],
      tableData: [],
      kml: [],
    }
  },
  mounted() {
    this.map = new BMap.Map('container')
    this.map.centerAndZoom('航空科技大厦', 20)
    this.map.enableScrollWheelZoom(true)
  },
  methods: {
    //定位区域
    searchCity() {
      this.coordinatesList = []
      const local = new BMap.LocalSearch(this.map, {
        renderOptions: { map: this.map, panel: 'result' },
        onSearchComplete: (results) => {
          if (local.getStatus() === BMAP_STATUS_SUCCESS && results.getPoi(0)) {
            const { uid } = results.getPoi(0)
            return this.queryUid(uid)
          }
          this.$message.error('百度API搜索出错，请稍后再试！')
        },
        pageCapacity: 1,
      })
      local.search(this.value)
    },
    //获取小区信息
    async queryUid(uid) {
      this.kml = []
      try {
        let url = `https://map.baidu.com/?reqflag=pcmap&from=webmap&qt=ext&uid=${uid}&ext_ver=new&l=18`
        // 第二种根据 uid 获取小区范围坐标
        // let url = `https://map.baidu.com/?pcevaname=mp&qt=ext&ext_ver=new&l=12&uid=${uid}`
        let arr = []
        this.coordinatesList = []
        const result = await axios.get(url)
        let content = result.data.content
        this.map.clearOverlays()
        if (content.hasOwnProperty('geo') && content.geo) {
          const geo = content.geo
          let points = this.coordinateToPoints(geo)
          if (points && points.indexOf(';') >= 0) {
            points = points.split(';')
          }
          for (let i = 0, len = points.length; i < len - 1; i++) {
            let temp = points[i].split(',')
            let convert = Conversion.BaiduToWgs84(temp[0], temp[1])
            // 导出 84 坐标所用
            this.kml.push(convert)
            // 地图绘制范围
            arr.push(new BMap.Point(parseFloat(temp[0]), parseFloat(temp[1])))
            this.coordinatesList.push([parseFloat(temp[0]), parseFloat(temp[1])])
          }
          // 地图绘制范围
          const polygon = new BMap.Polyline(arr, { strokeColor: 'blue', strokeWeight: 2, strokeOpacity: 0.5 })  //创建多边形
          this.map.addOverlay(polygon)
          this.map.setViewport(polygon.getPath())
          return this.tableData = this.coordinatesList.map(item => {
            return {
              id: uuidV4(),
              lng: Conversion.BaiduToWgs84(item[0], item[1])[0],
              lat: Conversion.BaiduToWgs84(item[0], item[1])[1],
            }
          })
        }
        this.tableData = []
        this.$message.error(`${this.value}  无范围可获取`)
      } catch (e) {
        this.$message.error(`百度API搜索出错，请稍后再试！`)
      }
    },
    //坐标转换
    coordinateToPoints(coordinate) {
      if (coordinate) {
        let points = ''
        const projection = BMAP_NORMAL_MAP.getProjection()
        if (coordinate && coordinate.indexOf('-') >= 0) {
          // 取点集合
          let tempco = coordinate.split('-')[1]
          if (tempco && tempco.indexOf(',') >= 0) {
            tempco = tempco.replace(';', '').split(',')
            //分割点，两个一组，组成百度米制坐标
            const temppoints = []
            for (let i = 0, len = tempco.length; i < len; i++) {
              const obj = {}
              obj.lng = tempco[i]
              obj.lat = tempco[i + 1]
              temppoints.push(obj)
              i++
            }
            //遍历米制坐标，转换为经纬度
            for (let i = 0, len = temppoints.length; i < len; i++) {
              const pos = temppoints[i]
              const point = projection.pointToLngLat(new BMap.Pixel(pos.lng, pos.lat))
              points += ([point.lng, point.lat].toString() + ';')
            }
          }
        }
        return points
      }
      this.$message.error(`百度API搜索出错，请稍后再试！`)
    },
    async exportFile() {
      try {
        const result = await ipcRenderer.invoke('exportSingleFile', JSON.stringify({
          title: this.value,
          geo: this.kml,
        }))
        if (result) {
          this.value = ''
          this.tableData = []
          this.map.clearOverlays()
          return this.$message.success('导出成功')
        }
        this.$message.error('导出失败')
      } catch (e) {
        this.$message.error('导出失败')
      }
    },
    // refresh() {
    //   this.reload()
    // },
  },
}
</script>

<style scoped lang='scss'>
::-webkit-scrollbar {
  display: none;
}

.el-input {
  width: 200px;
}
</style>