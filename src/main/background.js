'use strict'
import { app, protocol, BrowserWindow} from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

const isDevelopment = process.env.NODE_ENV !== 'production'
import { ipcMain } from 'electron'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
])

const gotTheLock = app.requestSingleInstanceLock();
// 单例锁，防止打开多个软件
if (!gotTheLock) {
  app.quit();
}

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    minHeight: 680,
    minWidth: 960,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: false,
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
