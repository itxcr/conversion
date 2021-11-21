'use strict'
import { app, protocol, BrowserWindow, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { ipcMain } from 'electron'
import fs from 'fs'
import GeoJson from 'geojson'
import toKml from 'tokml'
import { XLSX } from '../framework/utils'
import xlsx from 'xlsx'
import template from '../framework/mb.json'
import makeDir from 'make-dir'

const isDevelopment = process.env.NODE_ENV !== 'production'
let exportFilePath = ''

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
])

const gotTheLock = app.requestSingleInstanceLock()
// 单例锁，防止打开多个软件
if (!gotTheLock) {
  app.quit()
}

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    minHeight: 720,
    minWidth: 1020,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: false,
      devTools: process.env.NODE_ENV === 'development',
    },
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await win.loadURL('app://./index.html#main')
  }
  ipcMain.handle('window.maximize', async () => {
    win.setSkipTaskbar(false)
    if (win.isMaximized()) {
      win.webContents.send('window.status', {
        status: 'unmaximize',
      })
      return win.restore()
    }
    win.maximize()
    win.webContents.send('window.status', {
      status: 'maximize',
    })
  })
  ipcMain.handle('window.minimize', async () => {
    win.setSkipTaskbar(false)
    win.minimize()
  })
  ipcMain.handle('window.destroy', async () => {
    win.destroy()
  })

  ipcMain.handle('exportSingleFile', async (event, args) => {
    const { title, geo } = JSON.parse(args)
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: `导出 ${title}.kml`,
      defaultPath: title,
      filters: [{
        name: 'kml格式文件',
        extensions: ['kml'],
      }],
    })
    if (canceled) return false
    const geoJson = GeoJson.parse([{ name: title, polygon: [geo] }], { 'LineString': 'line', 'Polygon': 'polygon' })
    await fs.writeFileSync(filePath, toKml(geoJson), () => {
      console.log(`${title}.kml 导出成功`)
    })
    return true
  })

  ipcMain.handle('downloadTemplate', async (event, args) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: '模板下载',
      defaultPath: '模板.xlsx',
      buttonLabel: '保存',
      filters: [
        { name: 'Excel', extensions: ['xlsx'] },
      ],
    })
    if (canceled) return false
    const sheet = xlsx.utils.json_to_sheet(template)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, sheet, '模板')
    await xlsx.writeFile(workbook, filePath)
    return true
  })

  ipcMain.handle('selectImportFile', async (event, arg) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: '选择导入模板',
      buttonLabel: '确定',
      filters: [
        { name: 'Excel', extensions: ['xlsx', 'xls'] },
      ],
      properties: ['openFile'],
    })
    if (canceled) return false
    const data = XLSX.convert(XLSX.readFile(filePaths[0]))
    if (!data) return 'errorFile'
    if (data === 'tooLong') return data
    return {
      path: filePaths[0],
      data,
    }
  })

  ipcMain.handle('selectExportPath', async (event, arg) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: '选择导出路径',
        buttonLabel: '确定',
        properties: ['openDirectory'],
      },
    )
    if (canceled) return false
    exportFilePath = filePaths[0]
    return filePaths[0]
  })

  ipcMain.handle('exportKml', async (event, arg) => {
    let err = []
    let success = []
    for (let i = 0, len = arg.length; i < len; i++) {
      if (arg[i].geo === '失败') {
        err.push(arg[i].name)
        continue
      }
      if (!fs.existsSync(arg[i].filePath)) await makeDir(arg[i].filePath)
      const geoJson = GeoJson.parse([{ name: arg[i].name, polygon: [arg[i].geo] }],
        { 'LineString': 'line', 'Polygon': 'polygon' })
      await fs.writeFile(arg[i].fileName, toKml(geoJson), () => {
      })
      success.push(arg[i].name)
    }
    err = err.map(err => {
      return {
        '小区名称': err,
      }
    })
    const sheet = xlsx.utils.json_to_sheet(err)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, sheet, '失败')
    await xlsx.writeFile(workbook, `${exportFilePath}\\失败.xlsx`)
    return {
      success,
      err,
    }
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow().then(r => {
    console.log(r)
  })
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      // console.log('开发模式:', VUEJS_DEVTOOLS)
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  await createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
