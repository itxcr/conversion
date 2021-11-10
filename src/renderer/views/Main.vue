<template>
  <lay-out>
    <el-aside width='310px' class='left-aside'>
      <div class='custom-flex' style='position: fixed;z-index: 2;top: 100px;'>
        <el-input v-model.trim='value' clearable placeholder='请输入内容' style='margin-right: 14px;' />
        <el-tooltip effect='dark' content='定位小区' placement='top-start'>
          <el-button type='plain' class='fas fa-search-location' circle size='mini' @click='dw'
                     :disabled='value.length===0' />
        </el-tooltip>
        <el-tooltip class='item' effect='dark' content='导出文件' placement='top-start'>
          <el-button type='plain' class='fas fa-file-export' circle size='mini' @click='exportFile'
                     :disabled='tableData.length===0' />
        </el-tooltip>
      </div>
      <div style='user-select: text;margin-top: 80px;'>
        <el-table
          :data='tableData'
          border
        >
          <!--          <el-table-column-->
          <!--            prop='title'-->
          <!--            label='小区'-->
          <!--            align='center'-->
          <!--          >-->
          <!--          </el-table-column>-->
          <!--          <el-table-column-->
          <!--            prop='address'-->
          <!--            label='地址'-->
          <!--            align='center'-->
          <!--          >-->
          <!--          </el-table-column>-->
          <!--          <el-table-column-->
          <!--            label='目标小区'-->
          <!--            align='center'-->
          <!--            prop='title'-->
          <!--          >-->
          <!--          </el-table-column>-->
          <el-table-column
            label='区域范围'
            align='center'
          >
            <template slot-scope='{row}'>
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
import { Conversion } from '../../framework/utils'
import axios from 'axios'

export default {
  name: 'Main',
  inject: ['reload'],
  components: { LayOut },
  data() {
    return {
      value: '航空科技大厦',
      map: null,
      coordinatesList: [],
      tableData: [],
      kml: [],
    }
  },
  mounted() {
    this.map = new BMap.Map('container', {
      enableRotate: false,
      enableTilt: false,
    })
    // this.map.centerAndZoom('航空科技大厦', 15)
    // this.map.centerAndZoom(new BMap.Point(117.141278, 39.115441), 18)
    this.map.enableScrollWheelZoom(true)
    this.dw()
  },
  methods: {
    //定位区域，小地名，使用本地检索方法
    dw() {
      this.map.clearOverlays()
      this.coordinatesList = []
      const local = new BMap.LocalSearch(this.map, {
        renderOptions: { map: this.map },
      })
      local.search(this.value)
      local.setMarkersSetCallback((poi) => {
        console.log(poi, '获取poi')
        if (poi.length !== 0) {
          this.map.clearOverlays()
          //清除所有覆盖物后，在叠加第一个点
          // this.map.clearOverlays()
          // for (let i = 0; i < poi.length; i++) {
          //   const marker = new BMap.Marker(poi[i].point)
          //   this.map.addOverlay(marker)
          // }
          //根据获取到的poi id，查询边界坐标集合，画多边形
          const { uid, title } = poi[0]
          return this.queryUid(uid, title)
        } else {
          return this.$message.error('输入内容获取不到，请检查！')
        }
      })
    },
    //获取小区信息
    async queryUid(uid, title) {
      try {
        let url = `https://map.baidu.com/?reqflag=pcmap&from=webmap&qt=ext&uid=${uid}&ext_ver=new&l=5`
        // let url1 = 'http://map.baidu.com/?pcevaname=pc4.1&qt=ext&ext_ver=new&l=12&uid=' + uid;
        let arr = []
        this.coordinatesList = []
        const result = await axios.get(url)
        console.log('通过搜索到的第一个uid 获取边界', title)
        let content = result.data.content
        if (content.hasOwnProperty('geo') && content.geo) {
          const geo = content.geo
          let points = this.coordinateToPoints(geo)
          if (points && points.indexOf(';') >= 0) {
            points = points.split(';')
          }
          console.log(points, 7)
          for (let i = 0; i < points.length - 1; i++) {
            let temp = points[i].split(',')
            let convert = Conversion.BaiduToWgs84(temp[0], temp[1])
            arr.push(new BMap.Point(parseFloat(temp[0]), parseFloat(temp[1])))
            this.kml.push(convert)
            this.coordinatesList.push([parseFloat(temp[0]), parseFloat(temp[1])])
          }
          const polygon = new BMap.Polyline(arr, { strokeColor: 'blue', strokeWeight: 2, strokeOpacity: 0.8 })  //创建多边形
          this.map.addOverlay(polygon)
          this.map.setViewport(polygon.getPath())
          return this.tableData = this.coordinatesList.map(item => {
            return {
              lng: Conversion.BaiduToWgs84(item[0], item[1])[0],
              lat: Conversion.BaiduToWgs84(item[0], item[1])[1],
            }
          })
        }
        this.map.clearOverlays()
        this.tableData = []
        this.$message.error(`${this.value}  无范围可获取`)
      } catch (e) {
        this.$message.error(`百度接口请求失败`)
      }
    },
    //坐标转换
    coordinateToPoints(coordinate) {
      let points = ''
      if (coordinate) {
        const projection = BMAP_NORMAL_MAP.getProjection()
        console.log(coordinate, '坐标转换1, 通过 uid 获取 geo')
        console.log(projection, '坐标转换2  BMAP_NORMAL_MAP.getProjection')
        if (coordinate && coordinate.indexOf('-') >= 0) {
          coordinate = coordinate.split('-')
          console.log(coordinate, '坐标转换3 coordinate.split(\'-\')')
        }
        //取点集合
        let tempco = coordinate[1]
        console.log(tempco, 'tempco')
        if (tempco && tempco.indexOf(',') >= 0) {
          tempco = tempco.replace(';', '').split(',')
          console.log(tempco, '4')
        }
        //分割点，两个一组，组成百度米制坐标
        const temppoints = []
        for (let i = 0, len = tempco.length; i < len; i++) {
          const obj = new Object()
          obj.lng = tempco[i]
          obj.lat = tempco[i + 1]
          temppoints.push(obj)
          i++
        }
        console.log(temppoints, '5')
        //遍历米制坐标，转换为经纬度
        for (let i = 0, len = temppoints.length; i < len; i++) {
          const pos = temppoints[i]
          const point = projection.pointToLngLat(new BMap.Pixel(pos.lng, pos.lat))
          points += ([point.lng, point.lat].toString() + ';')
        }
      }
      console.log(points, '6')
      return points
    },
    async exportFile() {
      try {
        const result = await ipcRenderer.invoke('exportSingleFile', JSON.stringify({
          title: this.value,
          geo: this.kml,
        }))
        console.log(result)
        if (result) {
          this.value = ''
          this.tableData = []
          return this.$message.success('导出成功')
        }
        this.$message.error('导出失败')
      } catch (e) {
        this.$message.error('导出失败')
      } finally {
        this.kml = []
      }
    },
    refresh() {
      this.reload()
    },
  },
}
</script>

<style scoped lang='scss'>
::-webkit-scrollbar {
  /*隐藏滚轮*/
  display: none;
}
</style>