import gcoord from 'gcoord'
import xlsx from 'xlsx'
import { v4 as uuidV4 } from 'uuid'

class XLSX {
  static convert(sheets) {
    if (sheets.hasOwnProperty('Sheets')) {
      sheets = sheets.Sheets
      let persons = []
      for (let sheet in sheets) {
        if (sheets.hasOwnProperty(sheet)) {
          persons = persons.concat(xlsx.utils.sheet_to_json(sheets[sheet]))
          // break; // 如果只取第一张表，就取消注释这行
        }
      }
      if (persons[0].hasOwnProperty('省') && persons[0].hasOwnProperty('市') && persons[0].hasOwnProperty('区') && persons[0].hasOwnProperty('小区名称')) {
        return persons.reduce((pre, cur) => {
          return cur['省'] !== undefined && cur['市'] !== undefined && cur['区'] !== undefined && cur['小区名称'] !== undefined ? pre.concat({
            id: uuidV4(),
            province: cur['省'],
            city: cur['市'],
            area: cur['区'],
            community: cur['小区名称'],
            status: '未导出'
          }) : pre
        }, [])
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
