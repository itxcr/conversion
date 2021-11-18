import gcoord from 'gcoord'
import xlsx from 'xlsx'

class XLSX {
  static convert(sheets) {
    if (sheets.hasOwnProperty('Sheets')) {
      sheets = sheets.Sheets
      let fromTo = ''
      let persons = []
      for (let sheet in sheets) {
        if (sheets.hasOwnProperty(sheet)) {
          fromTo = sheets[sheet]['!ref']
          persons = persons.concat(xlsx.utils.sheet_to_json(sheets[sheet]))
          // break; // 如果只取第一张表，就取消注释这行
        }
      }
      if (persons[0].hasOwnProperty('省') && persons[0].hasOwnProperty('市') && persons[0].hasOwnProperty('区') && persons[0].hasOwnProperty('小区名称')) {
        return persons.map(v => {
          return `${v['省']}${v['市']}${v['区']}${v['小区名称']}`
        })
      }
    }
    return false
  }

  static readFile(path) {
    return xlsx.readFile(path)
  }
}


class Conversion {
  static BaiduToWgs84(lng, lat) {
    return gcoord.transform(
      [lng, lat],
      gcoord.BD09,
      gcoord.WGS84,
    )
  }

  // static BaiduToGcj02(lng, lat) {
  //   return gcoord.transform(
  //     [lng, lat],
  //     gcoord.BD09,
  //     gcoord.GCJ02,
  //   )
  // }
  //
  // static Wgs84ToGcj02(lng, lat) {
  //   return gcoord.transform(
  //     [lng, lat],
  //     gcoord.WGS84,
  //     gcoord.GCJ02,
  //   )
  // }
  //
  // static Wgs84ToBaidu(lng, lat) {
  //   return gcoord.transform(
  //     [lng, lat],
  //     gcoord.WGS84,
  //     gcoord.BD09,
  //   )
  // }
  //
  // static Gcj02ToWgs84(lng, lat) {
  //   return gcoord.transform(
  //     [lng, lat],
  //     gcoord.GCJ02,
  //     gcoord.WGS84,
  //   )
  // }
  //
  // static Gcj02ToBaidu(lng, lat) {
  //   return gcoord.transform(
  //     [lng, lat],
  //     gcoord.GCJ02,
  //     gcoord.BD09,
  //   )
  // }
}

export {
  Conversion,
  XLSX,
}
