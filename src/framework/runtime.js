class Runtime {
  static packageInfo() {
    return require('../../package.json')
  }

  static version() {
    return this.packageInfo().version
  }
}

export {
  Runtime,
}