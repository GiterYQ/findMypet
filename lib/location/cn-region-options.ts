/**
 * CN region options
 * 作用：提供首版手动地址兜底用的轻量中国省市区街道预设，不承担完整行政区数据库职责。
 * 联动：NoticeForm 的定位失败兜底、PetLocation 的 province/city/district/street 字段。
 * 层级：constants
 */
export type ChinaDistrictOption = {
  name: string;
  streets: string[];
};

export type ChinaCityOption = {
  name: string;
  districts: ChinaDistrictOption[];
};

export type ChinaProvinceOption = {
  name: string;
  cities: ChinaCityOption[];
};

export const chinaRegionOptions: ChinaProvinceOption[] = [
  {
    name: "北京市",
    cities: [
      {
        name: "北京市",
        districts: [
          { name: "朝阳区", streets: ["望京街道", "三里屯街道", "建外街道", "亚运村街道"] },
          { name: "海淀区", streets: ["中关村街道", "学院路街道", "清河街道", "上地街道"] },
          { name: "东城区", streets: ["东华门街道", "景山街道", "交道口街道"] },
          { name: "西城区", streets: ["金融街街道", "什刹海街道", "德胜街道"] }
        ]
      }
    ]
  },
  {
    name: "上海市",
    cities: [
      {
        name: "上海市",
        districts: [
          { name: "浦东新区", streets: ["陆家嘴街道", "花木街道", "张江镇", "金桥镇"] },
          { name: "徐汇区", streets: ["徐家汇街道", "湖南路街道", "漕河泾街道"] },
          { name: "静安区", streets: ["南京西路街道", "静安寺街道", "彭浦新村街道"] },
          { name: "黄浦区", streets: ["外滩街道", "南京东路街道", "豫园街道"] }
        ]
      }
    ]
  },
  {
    name: "广东省",
    cities: [
      {
        name: "广州市",
        districts: [
          { name: "天河区", streets: ["天河南街道", "石牌街道", "珠吉街道"] },
          { name: "越秀区", streets: ["北京街道", "东山街道", "建设街道"] },
          { name: "海珠区", streets: ["赤岗街道", "江南中街道", "琶洲街道"] }
        ]
      },
      {
        name: "深圳市",
        districts: [
          { name: "南山区", streets: ["粤海街道", "蛇口街道", "招商街道"] },
          { name: "福田区", streets: ["福田街道", "莲花街道", "华强北街道"] },
          { name: "罗湖区", streets: ["东门街道", "桂园街道", "黄贝街道"] }
        ]
      }
    ]
  },
  {
    name: "浙江省",
    cities: [
      {
        name: "杭州市",
        districts: [
          { name: "西湖区", streets: ["西溪街道", "古荡街道", "转塘街道"] },
          { name: "上城区", streets: ["湖滨街道", "小营街道", "南星街道"] },
          { name: "滨江区", streets: ["西兴街道", "长河街道", "浦沿街道"] }
        ]
      }
    ]
  },
  {
    name: "四川省",
    cities: [
      {
        name: "成都市",
        districts: [
          { name: "锦江区", streets: ["春熙路街道", "三圣街道", "成龙路街道"] },
          { name: "武侯区", streets: ["浆洗街街道", "玉林街道", "簇桥街道"] },
          { name: "高新区", streets: ["桂溪街道", "肖家河街道", "中和街道"] }
        ]
      }
    ]
  },
  {
    name: "重庆市",
    cities: [
      {
        name: "重庆市",
        districts: [
          { name: "渝中区", streets: ["解放碑街道", "两路口街道", "大坪街道"] },
          { name: "江北区", streets: ["观音桥街道", "华新街街道", "寸滩街道"] },
          { name: "渝北区", streets: ["龙溪街道", "回兴街道", "两路街道"] }
        ]
      }
    ]
  },
  {
    name: "湖北省",
    cities: [
      {
        name: "武汉市",
        districts: [
          { name: "江岸区", streets: ["大智街道", "永清街道", "后湖街道"] },
          { name: "武昌区", streets: ["水果湖街道", "中南路街道", "积玉桥街道"] },
          { name: "洪山区", streets: ["珞南街道", "关山街道", "狮子山街道"] }
        ]
      }
    ]
  },
  {
    name: "江苏省",
    cities: [
      {
        name: "南京市",
        districts: [
          { name: "玄武区", streets: ["梅园新村街道", "新街口街道", "玄武门街道"] },
          { name: "鼓楼区", streets: ["湖南路街道", "宁海路街道", "江东街道"] },
          { name: "建邺区", streets: ["沙洲街道", "双闸街道", "莫愁湖街道"] }
        ]
      },
      {
        name: "苏州市",
        districts: [
          { name: "姑苏区", streets: ["平江街道", "沧浪街道", "金阊街道"] },
          { name: "工业园区", streets: ["娄葑街道", "斜塘街道", "唯亭街道"] },
          { name: "吴中区", streets: ["长桥街道", "木渎镇", "胥口镇"] }
        ]
      }
    ]
  }
];

export function getChinaProvinceOption(province?: string) {
  return chinaRegionOptions.find((option) => option.name === province);
}

export function getChinaCityOptions(province?: string) {
  return getChinaProvinceOption(province)?.cities ?? [];
}

export function getChinaCityOption(province?: string, city?: string) {
  return getChinaCityOptions(province).find((option) => option.name === city);
}

export function getChinaDistrictOptions(province?: string, city?: string) {
  return getChinaCityOption(province, city)?.districts ?? [];
}

export function getChinaDistrictOption(province?: string, city?: string, district?: string) {
  return getChinaDistrictOptions(province, city).find((option) => option.name === district);
}

export function getChinaStreetOptions(province?: string, city?: string, district?: string) {
  return getChinaDistrictOption(province, city, district)?.streets ?? [];
}
