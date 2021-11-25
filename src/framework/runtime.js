class Runtime {
  static packageInfo() {
    return require('../../package.json')
  }

  static name() {
    return this.packageInfo().name
  }

  static version() {
    return this.packageInfo().version
  }
}

export {
  Runtime,
}