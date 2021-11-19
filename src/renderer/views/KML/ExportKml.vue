<template>
  <lay-out>
    <el-main style='display: flex;justify-content: space-around'>
      <ui-card>
        <el-descriptions title='下载模板'>
          <el-descriptions-item label='下载模板'>
            <el-button type='primary' round size='mini' @click='downloadTemplate' :disabled='btnDisable'>
              <span>下载</span>
            </el-button>
          </el-descriptions-item>
        </el-descriptions>
        <el-descriptions title='导出路径'>
          <el-descriptions-item label='选择路径'>
            <el-button type='primary' round size='mini' @click='selectExportPath' :disabled='btnDisable'>
              <span v-if='!exportPath'>选择</span>
              <span v-if='exportPath'>更换</span>
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label='导出路径' v-if='exportPath'>
            {{ exportPath }}
          </el-descriptions-item>
        </el-descriptions>
        <el-descriptions title='导入文档'>
          <el-descriptions-item label='导入文件'>
            <el-button type='primary' round size='mini' @click='selectImportFile'
                       :disabled='!exportPath || btnDisable'>
              选择
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label='文件路径' v-if='importPath'>
            {{ importPath }}
          </el-descriptions-item>
        </el-descriptions>
        <el-descriptions title='开始导出' v-if='exportPath && importPath'>
          <el-descriptions-item label='执行操作'>
            <el-button type='primary' round size='mini' @click='beginExport' :disabled='btnDisable'>导出</el-button>
          </el-descriptions-item>
        </el-descriptions>
      </ui-card>
      <!--      <ui-card v-if='xlsx.length !== 0'>-->
      <!--        <el-descriptions>-->
      <!--          <el-descriptions-item>-->
      <!--            <el-table-->
      <!--              :data='xlsx'-->
      <!--              border-->
      <!--              max-height='560'-->
      <!--              style='width: 100%'>-->
      <!--              <el-table-column-->
      <!--                prop='province'-->
      <!--                label='省'-->
      <!--                width='70'-->
      <!--              >-->
      <!--              </el-table-column>-->
      <!--              <el-table-column-->
      <!--                prop='city'-->
      <!--                label='市'-->
      <!--                width='70'-->
      <!--              >-->
      <!--              </el-table-column>-->
      <!--              <el-table-column-->
      <!--                prop='area'-->
      <!--                width='70'-->
      <!--                label='区'>-->
      <!--              </el-table-column>-->
      <!--              <el-table-column-->
      <!--                prop='community'-->
      <!--                label='小区名称'-->
      <!--                min-width='160'>-->
      <!--              </el-table-column>-->
      <!--              <el-table-column-->
      <!--                prop='status'-->
      <!--                label='状态'-->
      <!--                min-width='80'>-->
      <!--              </el-table-column>-->
      <!--            </el-table>-->
      <!--          </el-descriptions-item>-->
      <!--        </el-descriptions>-->
      <!--      </ui-card>-->
    </el-main>
  </lay-out>
</template>

<script>
import LayOut from '@/components/LayOut'
import UiCard from '@/components/UiCard'
import { ipcRenderer } from 'electron'
import axios from 'axios'
import { Conversion } from '@framework/utils'

export default {
  name: 'ExportKml',
  components: { LayOut, UiCard },
  data() {
    return {
      xlsx: [],
      exportPath: '',
      importPath: '',
      btnDisable: false,
    }
  },
  methods: {
    async downloadTemplate() {
      const result = await ipcRenderer.invoke('downloadTemplate')
      if (!result) return
      this.$message.success('模板下载成功')
    },
    async selectExportPath() {
      const result = await ipcRenderer.invoke('selectExportPath')
      if (!result) return
      this.exportPath = result
    },
    async selectImportFile() {
      const result = await ipcRenderer.invoke('selectImportFile')
      if (!result) return
      if (result === 'errorFile') {
        this.importPath = ''
        this.xlsx = []
        return this.$message.error('选择文件格式有误，请下载模板再操作！~~')
      }
      if (result === 'tooLong') {
        this.importPath = ''
        this.xlsx = []
        return this.$message.error('搜索条数不能多余 3000 ！！！')
      }
      this.importPath = result.path
      this.xlsx = result.data.map(v => {
        return {
          name: v.community,
          address: `${v.province}${v.city}${v.area}${v.community}`,
          filePath: `${this.exportPath}\\${v.province}\\${v.city}\\${v.area}`,
          fileName: `${this.exportPath}\\${v.province}\\${v.city}\\${v.area}\\${v.community}.kml`,
        }
      })
    },
    async beginExport() {
      this.btnDisable = true
      const promiseArr = []
      const geoArr = []
      const local = new BMap.LocalSearch(new BMap.Map(), {
        pageCapacity: 1,
      })
      for (let i = 0, len = this.xlsx.length; i < len; i++) {
        promiseArr.push(await this.returnPromise(i, local))
      }
      let res = await Promise.all(promiseArr)
      // res = res.filter(v => {
      //   return v.uid !== '失败'
      // })
      for (let i = 0, len = res.length; i < len; i++) {
        geoArr.push(await this.returnSearchPromise({ uid: res[i].uid, name: res[i].name }))
      }
      console.log(await Promise.all(geoArr))
      // const result = await ipcRenderer.invoke('exportKml', res)
      // this.btnDisable = result ? !result : result
    },
    returnPromise(index, local) {
      return new Promise((resolve => {
        local.search(`${this.xlsx[index].address}`)
        local.setSearchCompleteCallback((result) => {
          setTimeout(() => {
            resolve({
              name: this.xlsx[index].name,
              address: result.keyword,
              filePath: this.xlsx[index].filePath,
              fileName: this.xlsx[index].fileName,
              uid: result.getPoi(0) && result.getPoi(0).uid ? result.getPoi(0).uid : '失败',
            })
          }, 50)
        })
      }))
    },
    async returnSearchPromise({ uid, name }) {
      const result = await axios.get(`https://map.baidu.com/?reqflag=pcmap&from=webmap&qt=ext&uid=${uid}&ext_ver=new&l=18`)
      if (result.data.content.hasOwnProperty('geo') && result.data.content.geo) {
        return new Promise((resolve => {
          resolve({
            name,
            geo: this.coordinateToPoints(result.data.content.geo),
          })
        }))
      }
    },
    coordinateToPoints(coordinate) {
      if (coordinate && coordinate.indexOf('-') >= 0) {
        const wgsArr = []
        const projection = BMAP_NORMAL_MAP.getProjection()
        let tempco = coordinate.split('-')[1]
        if (tempco && tempco.indexOf(',') >= 0) {
          tempco = tempco.replace(';', '').split(',')
          //分割点，两个一组，组成百度米制坐标
          //遍历米制坐标，转换为经纬度
          for (let i = 0, len = tempco.length; i < len; i++) {
            let point = projection.pointToLngLat(new BMap.Pixel(tempco[i], tempco[i + 1]))
            wgsArr.push(Conversion.BaiduToWgs84(point.lng, point.lat))
            i++
          }
          return wgsArr
        }
      }
      return []
    },
  },
  beforeDestroy() {
    this.xlsx = []
  },
}
</script>

<style scoped lang='scss'>
::v-deep .el-descriptions-item__container {
  align-items: center;
}

.el-descriptions {
  &:nth-child(n+2) {
    margin-top: 50px;
  }
}

::v-deep .el-descriptions-item__label.has-colon::after {
  content: ''
}
</style>