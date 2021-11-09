<template>
  <lay-out>
    <el-aside width='360px' class='left-aside'>
      <div class='custom-flex'>
        <el-input v-model='value' placeholder='请输入内容' style='margin-right: 30px;'></el-input>
        <el-button type='plain' icon='el-icon-position' circle size='mini' @click='dw'></el-button>
      </div>
      <div style='margin-top: 20px;user-select: text'>
        <el-table
          :data='tableData'
          border
          style='width: 100%'>
          <el-table-column
            prop='title'
            label='小区'
            align='center'
          >
          </el-table-column>
          <el-table-column
            prop='address'
            label='地址'
            align='center'
          >
          </el-table-column>
          <el-table-column
            label='坐标'
            align='center'
          >
            <template slot-scope='{row}'>
              经度: {{ row.point.lng }}
              <br />
              纬度: {{ row.point.lat }}
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
      this.coordinatesList = []
      const local = new BMap.LocalSearch(this.map, {
        renderOptions: { map: this.map },
      })
      local.setMarkersSetCallback((poi) => {
        console.log(poi, '获取poi')
        if (poi.length !== 0) {
          this.tableData = poi
          //清除所有覆盖物后，在叠加第一个点
          this.map.clearOverlays()
          for (let i = 0; i < poi.length; i++) {
            const marker = new BMap.Marker(poi[i].point)
            this.map.addOverlay(marker)
          }
          //根据获取到的poi id，查询边界坐标集合，画多边形
          const { uid, title } = poi[0]
          this.queryUid(uid, title)
        }
      })
      local.search(this.value)
      this.map.clearOverlays()
    },
    //获取小区信息
    async queryUid(uid, title) {
      let url = `https://map.baidu.com/?reqflag=pcmap&from=webmap&qt=ext&uid=${uid}&ext_ver=new&l=18`
      const result = await axios.get(url)
      console.log('通过搜索到的第一个uid 获取边界', title)
      let content = result.data.content
      if (content.hasOwnProperty('geo') && content.geo) {
        const geo = content.geo
        let points = this.coordinateToPoints(geo)
        console.log(points, 7)
        if (points && points.indexOf(';') >= 0) {
          points = points.split(';')
          points.pop()
        }
        const arr = []
        for (let i = 0; i < points.length; i++) {
          const temp = points[i].split(',')
          arr.push(new BMap.Point(parseFloat(temp[0]), parseFloat(temp[1])))
          this.coordinatesList.push([parseFloat(temp[0]), parseFloat(temp[1])])
        }
        const polygon = new BMap.Polyline(arr, { strokeColor: 'blue', strokeWeight: 2, strokeOpacity: 0.5 })  //创建多边形
        this.map.addOverlay(polygon)
        this.map.setViewport(polygon.getPath())
        return console.log(this.coordinatesList, 8)
      }
      this.map.clearOverlays()
      this.$message.error(`${this.value}  无范围可获取`)
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
    refresh() {
      this.reload()
    },
  },
}
</script>

<style scoped lang='scss'>

</style>