<template>
  <lay-out>
    <el-aside width='420px' class='left-aside'>
      <div class='custom-flex'>
        <el-input v-model='value' placeholder='请输入内容' style='margin-right: 30px;'></el-input>
        <el-button type='plain' icon='el-icon-position' circle size='mini' @click='pd'></el-button>
      </div>
      <div style='margin-top: 20px;user-select: text'>
        <el-table
          :data='tableData'
          border
          style='width: 100%'>
          <el-table-column
            prop='name'
            label='小区'
          >
          </el-table-column>
          <el-table-column
            prop='lng'
            label='经度'
          >
          </el-table-column>
          <el-table-column
            prop='lat'
            label='纬度'>
          </el-table-column>
        </el-table>
      </div>
    </el-aside>
    <el-main>
      <el-button type='plain' icon='el-icon-refresh-left' circle size='mini' @click='refresh'></el-button>
      <div id='container' style='width:100%;height:90%;margin-top: 20px;'></div>
    </el-main>
  </lay-out>
</template>

<script>
import LayOut from '@/components/LayOut'
import { Conversion } from '../../framework/utils'
import { logger } from '../../framework/logging'

export default {
  name: 'Main',
  inject: ['reload'],
  components: { LayOut },
  data() {
    return {
      value: '',
      patter: /['省'|'市'|'区'|'县']$/,
      map: null,
      coordinatesList: [],
      tableData: [
        {
          name: '瑞丽园',
          lng: '117.141278',
          lat: '39.115441',
        },
        {
          name: '瑞丽园',
          lng: '117.141278',
          lat: '39.115441',
        },
      ],
      geojson: {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'Polygon',
              'coordinates': [
                [
                  [1, 2],
                ],
              ],
            },
          },
        ],
      },
    }
  },
  mounted() {
    this.map = new BMap.Map('container', {
      enableRotate: false,
      enableTilt: false,
    })
    this.tableData[0].lng = Conversion.BaiduToWgs84(117.141278, 39.115441)[0]
    this.tableData[0].lat = Conversion.BaiduToWgs84(117.141278, 39.115441)[1]
    // this.map.centerAndZoom('天津市津南区惠安花园', 15)
    this.map.centerAndZoom(new BMap.Point(117.141278, 39.115441), 18)
    this.map.enableScrollWheelZoom(true)
  },
  methods: {
    //定位区域，小地名，使用本地检索方法
    dw() {
      var local = new BMap.LocalSearch(this.map, {
        renderOptions: { map: this.map },
      })
      local.setMarkersSetCallback(function(pois) {
        console.log(pois)
        //清除所有覆盖物后，在叠加第一个点
        this.map.clearOverlays()
        for (var i = 0; i < pois.length; i++) {
          var marker = new BMap.Marker(pois[i].point)
          this.map.addOverlay(marker)
        }
        //根据获取到的poi id，查询边界坐标集合，画多边形
        var uid = pois[0].uid
        queryUid(uid)
      })
      local.search(value)
      this.map.clearOverlays()
    },
    //获取小区信息
    queryUid(uid) {
      let url1 = 'http://map.baidu.com/?pcevaname=pc4.1&qt=ext&ext_ver=new&l=12&uid=' + uid
      let url2 = `http://map.baidu.com/?reqflag=pcmap&from=webmap&qt=ext&uid=${uid}&ext_ver=new&l=18`
      $.ajax({
        async: false,
        url: url2,
        dataType: 'jsonp',
        jsonp: 'callback',
        success: function(result) {
          content = result.content
          if (null != content.geo && content.geo != undefined) {
            var geo = content.geo
            var points = this.coordinateToPoints(geo)

            //point分组，得到多边形的每一个点，画多边形
            if (points && points.indexOf(';') >= 0) {
              points = points.split(';')
            }
            var arr = []
            console.log(points)
            for (var i = 0; i < points.length - 1; i++) {
              var temp = points[i].split(',')
              arr.push(new BMap.Point(parseFloat(temp[0]), parseFloat(temp[1])))
              coordinatesList.push([parseFloat(temp[0]), parseFloat(temp[1])])
            }

            var polygon = new BMap.Polygon(arr, { strokeColor: 'blue', strokeWeight: 2, strokeOpacity: 0.5 })  //创建多边形
            map.addOverlay(polygon)   //增加多边形
            //生成kml并下载
            console.log(coordinatesList)
            geojson.features[0].geometry.coordinates[0].push(coordinatesList)
            downKml(geojson)
          }
        },
        timeout: 3000,
      })
    },
    //获取边界
    getBoundary() {
      var bdary = new BMap.Boundary()
      bdary.get(value, function(rs) {       //获取行政区域
        this.map.clearOverlays()        //清除地图覆盖物
        var count = rs.boundaries.length //行政区域的点有多少个
        for (var i = 0; i < count; i++) {
          var ply = new BMap.Polygon(rs.boundaries[i], {
            strokeWeight: 1,
            strokeColor: '#ff0000',
          }) //建立多边形覆盖物
          this.map.addOverlay(ply)  //添加覆盖物
          this.map.setViewport(ply.getPath())    //调整视野
        }
      })
    },
    //正则表达式，满足条件后调用
    pd() {
      if (this.patter.test(this.value) == true) {//关键字结尾是省市县区就调用下面方法
        this.getBoundary()
        if (/社区|小区$/.test(this.value) == true) {//因为区后面结尾，会有小区和社区，即做了一个字方法
          this.dw()
        }
      } else {//关键字结尾没有省市县区结尾就调用此方法
        this.dw()
      }
    },
    //坐标转换
    coordinateToPoints(coordinate) {
      console.log(coordinate)
      var points = ''
      if (coordinate) {
        var projection = BMAP_NORMAL_MAP.getProjection()

        if (coordinate && coordinate.indexOf('-') >= 0) {
          coordinate = coordinate.split('-')
        }
        //取点集合
        var tempco = coordinate[1]
        if (tempco && tempco.indexOf(',') >= 0) {
          tempco = tempco.replace(';', '').split(',')
        }
        //分割点，两个一组，组成百度米制坐标
        var temppoints = []
        for (var i = 0, len = tempco.length; i < len; i++) {
          var obj = new Object()
          obj.lng = tempco[i]
          obj.lat = tempco[i + 1]
          temppoints.push(obj)
          i++
        }
        //遍历米制坐标，转换为经纬度
        for (var i = 0, len = temppoints.length; i < len; i++) {
          //var pos = coordinate[i].split(',');
          var pos = temppoints[i]
          var point = projection.pointToLngLat(new BMap.Pixel(pos.lng, pos.lat))
          points += ([point.lng, point.lat].toString() + ';')
        }
      }
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