import gcoord from 'gcoord'

class Conversion {
  static BaiduToWgs84(lng, lat) {
    return gcoord.transform(
      [lng, lat],
      gcoord.BD09,
      gcoord.WGS84,
    )
  }

  static BaiduToGcj02(lng, lat) {
    return gcoord.transform(
      [lng, lat],
      gcoord.BD09,
      gcoord.GCJ02,
    )
  }

  static Wgs84ToGcj02(lng, lat) {
    return gcoord.transform(
      [lng, lat],
      gcoord.WGS84,
      gcoord.GCJ02,
    )
  }

  static Wgs84ToBaidu(lng, lat) {
    return gcoord.transform(
      [lng, lat],
      gcoord.WGS84,
      gcoord.BD09,
    )
  }

  static Gcj02ToWgs84(lng, lat) {
    return gcoord.transform(
      [lng, lat],
      gcoord.GCJ02,
      gcoord.WGS84,
    )
  }

  static Gcj02ToBaidu(lng, lat) {
    return gcoord.transform(
      [lng, lat],
      gcoord.GCJ02,
      gcoord.BD09,
    )
  }
}

export {
  Conversion,
}
