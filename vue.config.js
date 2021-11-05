const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  pluginOptions: {
    electronBuilder: {
      mainProcessFile: 'src/main/background.js',
      builderOptions: {
        appId: 'com.xcr.conversion',
        productName: 'Conversion',
        copyright: 'Copyright @xcr 2021',
        asar: true,
        win: {
          // win相关配置
          icon: 'public/favicon.ico', // 图标256*256
          target: [
            {
              target: 'nsis',
              arch: [
                'x64', //64位
              ],
            },
          ],
        },
        nsis: {
          oneClick: false, // 是否一键安装
          shortcutName: 'Conversion',
          allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowToChangeInstallationDirectory: true, // 允许修改安装目录
          installerIcon: 'public/favicon.ico',// 安装图标
          uninstallerIcon: 'public/favicon.ico',//卸载图标
          installerHeaderIcon: 'public/favicon.ico', // 安装时头部图标
          createDesktopShortcut: false, // 创建桌面图标
          createStartMenuShortcut: false,// 创建开始菜单图标
        },
      },
    },
  },
  configureWebpack: config => {
    config.entry.app = './src/renderer/main.js'
    return {
      resolve: {
        alias: {
          '@': resolve('src/renderer'),
        },
      },
    }
  },
}