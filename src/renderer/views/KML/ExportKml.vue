<template>
  <lay-out>
    <el-main style='display: flex;justify-content: space-around'>
      <ui-card>
        <el-descriptions title='下载模板'>
          <el-descriptions-item label='下载模板'>
            <el-button type='primary' round size='mini' @click='downloadTemplate'>
              <span>下载</span>
            </el-button>
          </el-descriptions-item>
        </el-descriptions>
        <el-descriptions title='导出路径'>
          <el-descriptions-item label='选择路径'>
            <el-button type='primary' round size='mini' @click='selectExportPath'>
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
            <el-button type='primary' round size='mini' @click='selectImportFile' :disabled='!exportPath'>
              选择
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label='文件路径' v-if='importPath'>
            {{ importPath }}
          </el-descriptions-item>
        </el-descriptions>
        <el-descriptions title='开始导出' v-if='exportPath && importPath'>
          <el-descriptions-item label='执行操作'>
            <el-button type='primary' round size='mini' @click='beginExport'>导出</el-button>
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

export default {
  name: 'ExportKml',
  components: { LayOut, UiCard },
  data() {
    return {
      xlsx: [],
      exportPath: '',
      importPath: '',
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
          address: `${v.province}${v.city}${v.area}${v.community}`,
          filePath: `${v.province}/${v.city}/${v.area}`,
        }
      })
    },
    async beginExport() {
      const promiseArr = []
      const local = new BMap.LocalSearch(new BMap.Map(), {
        pageCapacity: 1,
      })
      for (let i = 0, len = this.xlsx.length; i < len; i++) {
        promiseArr.push(await this.returnPromise(i, local))
      }
      const res = await Promise.all(promiseArr)
      await ipcRenderer.invoke('exportKml', res)
    },
    returnPromise(index, local) {
      return new Promise((resolve => {
        local.search(`${this.xlsx[index].address}`)
        local.setSearchCompleteCallback((result) => {
          setTimeout(() => {
            resolve({
              address: result.keyword,
              filePath: this.xlsx[index].filePath,
              uid: result.getPoi(0) && result.getPoi(0).uid ? result.getPoi(0).uid : '失败',
            })
          }, 500)
        })
      }))
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