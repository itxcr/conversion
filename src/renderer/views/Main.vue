<template>
  <lay-out>
    <el-aside width='220px' class='left-aside'>
      <input id='value' value='淮海工学院东港学院-郁洲书院' type='text'>
      　　 <input type='submit' @click='pd()' value='定位'>
    </el-aside>
    <el-main>
      <div id='allmap' style='width:100%;height:600px;'></div>

    </el-main>
  </lay-out>
</template>

<script>
import LayOut from '@/components/LayOut'

export default {
  name: 'Main',
  components: { LayOut },
  data() {
    return {
      value: '',
      patter : /['省'|'市'|'区'|'县']$/,
      map: null
    }
  },
  mounted() {
    this.map = new BMap.Map('allmap')
    this.map.centerAndZoom('北京市', 10)
  },
  methods: {
    pd() {
      if (this.patter.test(this.value) == true) {//关键字结尾是省市县区就调用下面方法
        getBoundary()
        if (/社区|小区$/.test(this.value) == true) {//因为区后面结尾，会有小区和社区，即做了一个字方法
          this.dw()
        }
      } else {//关键字结尾没有省市县区结尾就调用此方法
        this.dw()
      }
    },
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
    getBoundary() {
      var bdary = new BMap.Boundary();
      bdary.get(value, function(rs) {       //获取行政区域
        this.map.clearOverlays();        //清除地图覆盖物
        var count = rs.boundaries.length; //行政区域的点有多少个
        for (var i = 0; i < count; i++) {
          var ply = new BMap.Polygon(rs.boundaries[i], {
            strokeWeight: 1,
            strokeColor: '#ff0000'
          }); //建立多边形覆盖物
          this.map.addOverlay(ply);  //添加覆盖物
          this.map.setViewport(ply.getPath());    //调整视野
        }
      });
    }
  },

}
</script>

<style scoped>

</style>