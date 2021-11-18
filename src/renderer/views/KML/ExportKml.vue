<template>
  <lay-out>
    <el-main style='display: flex;justify-content: space-around '>
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
            <el-button type='primary' round size='mini' @click='selectImportFile' :disabled='!exportPath'>选择</el-button>
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
      xlsx: null,
      exportPath: '',
      importPath: '',
    }
  },
  mounted() {
    // this.xlsx = localStorage.getItem('xlsxData')
    // const workbook = JSON.parse(this.xlsx)
    // console.log(XLSX.convert(workbook))
  },
  methods: {
    async downloadTemplate() {
      const result = await ipcRenderer.invoke('downloadTemplate')
      if (!result) return
      this.$message.success('模板下载成功')
      console.log(result)
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
        return this.$message.error('选择文件格式有误，请下载模板再操作！~~')
      }
      this.importPath = result.path
      this.xlsx = result.data
      localStorage.setItem('xlsxData', JSON.stringify(result.data))
    },
    beginExport() {
      console.log('开始导出')
    },
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
</style>