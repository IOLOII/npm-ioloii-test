let metaConfig = {
  // ['keys', [
  //   '路网','桥梁','隧道','涵洞','路产'
  // ]],
  路网: [
    {
      name: "路网",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true, // 控制复选框是否显示
      value: false, // 控制复选框的值
      childrenMultiple: true, // 是否支持显示多个子级,定义子级勾选时是否互斥，默认和headLineCheckBox一致
      // 国省县乡村
      children: [
        {
          name: "国道",
          layerName: "neimenggu:nm_eeds_gd",
          icon: "iconfont XXX",
          style: { color: "#191970", width: 2 },
          value: false,
        },
        {
          name: "省道",
          layerName: "neimenggu:nm_eeds_sd",
          icon: "iconfont XXX",
          style: { color: "#191970", width: 2 },
          value: false,
        },
        {
          name: "县道",
          layerName: "neimenggu:nm_eeds_xd",
          icon: "iconfont XXX",
          style: { color: "#191970", width: 2 },
          value: false,
        },
        {
          name: "乡道",
          layerName: "neimenggu:nm_eeds_yd",
          icon: "iconfont XXX",
          style: { color: "#191970", width: 2 },
          value: false,
        },
        {
          name: "村道",
          layerName: "neimenggu:nm_eeds_cd",
          icon: "iconfont XXX",
          style: { color: "#191970", width: 2 },
          value: false,
        },
      ],
    },
  ],

  桥梁: [
    {
      name: "桥梁评定等级",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      // 一类，二类，三类，四类，五类
      children: [
        { name: "一类", icon: "iconfont XXX", value: false },
        { name: "二类", icon: "iconfont XXX", value: false },
        { name: "三类", icon: "iconfont XXX", value: false },
        { name: "四类", icon: "iconfont XXX", value: false },
        { name: "五类", icon: "iconfont XXX", value: false },
      ],
    },
    {
      name: "桥梁分类（长度）",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      children: [
        // 特大桥，大桥，中桥，小桥
        { name: "特大桥", icon: "iconfont XXX", value: false },
        { name: "大桥", icon: "iconfont XXX", value: false },
        { name: "中桥", icon: "iconfont XXX", value: false },
        { name: "小桥", icon: "iconfont XXX", value: false },
      ],
    },
  ],
  隧道: [
    {
      name: "隧道评定等级",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      // 一类，二类，三类，四类，五类
      children: [
        { name: "一类", icon: "iconfont XXX", value: false },
        { name: "二类", icon: "iconfont XXX", value: false },
        { name: "三类", icon: "iconfont XXX", value: false },
        { name: "四类", icon: "iconfont XXX", value: false },
        { name: "五类", icon: "iconfont XXX", value: false },
      ],
    },
    {
      name: "隧道分类（长度）",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      children: [
        // 特大隧道，大隧道，中隧道，小隧道
        { name: "特大隧道", icon: "iconfont XXX", value: false },
        { name: "大隧道", icon: "iconfont XXX", value: false },
        { name: "中隧道", icon: "iconfont XXX", value: false },
        { name: "小隧道", icon: "iconfont XXX", value: false },
      ],
    },
  ],

  涵洞: [
    {
      name: "涵洞位置",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      // 主线涵洞，匝道涵洞
      children: [
        { name: "主线涵洞", icon: "iconfont XXX", value: false },
        { name: "匝道涵洞", icon: "iconfont XXX", value: false },
      ],
    },
    {
      name: "行政等级",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      // 县道，乡道，村道，专用公路
      children: [
        { name: "县道", icon: "iconfont XXX", value: false },
        { name: "乡道", icon: "iconfont XXX", value: false },
        { name: "村道", icon: "iconfont XXX", value: false },
        { name: "专用公路", icon: "iconfont XXX", value: false },
      ],
    },
  ],

  路产: [
    // 服务设施，服务设施，管理设施
    {
      name: "服务设施1",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      // 交通标志，标线，护栏，防护设施，照明设施，排水设施
      children: [
        {
          prop: "tpLabel",
          name: "交通标志",
          icon: "iconfont XXX",
          value: false,
        },
        { prop: "tpMarking", name: "标线", icon: "iconfont XXX", value: false },
        {
          prop: "tpGuardrail",
          name: "护栏",
          icon: "iconfont XXX",
          value: false,
        },
        {
          prop: "tpSavefacilities",
          name: "防护设施",
          icon: "iconfont XXX",
          value: false,
        },
        {
          prop: "tpLighting",
          name: "照明设施",
          icon: "iconfont XXX",
          value: false,
        },
        {
          prop: "tpDrainage",
          name: "排水设施",
          icon: "iconfont XXX",
          value: false,
        },
      ],
    },
    {
      name: "服务设施2",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      // 收费站，服务站，加油站，停车区
      children: [
        {
          prop: "tpTollStation",
          name: "收费站",
          icon: "iconfont XXX",
          value: false,
        },
        { prop: "tpSst", name: "服务站", icon: "iconfont XXX", value: false },
        {
          prop: "tpPetrolStation",
          name: "加油站",
          icon: "iconfont XXX",
          value: false,
        },
        {
          prop: "tpParkingLot",
          name: "停车区",
          icon: "iconfont XXX",
          value: false,
        },
      ],
    },
    {
      name: "管理设施",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      // 治超站点，公路管理站，桥梁养护牌，监控设备
      children: [
        {
          prop: "tpSuper",
          name: "治超站点",
          icon: "iconfont XXX",
          value: false,
        },
        {
          prop: "tpStation",
          name: "公路管理站",
          icon: "iconfont XXX",
          value: false,
        },
        {
          prop: "tpPlate",
          name: "桥梁养护牌",
          icon: "iconfont XXX",
          value: false,
        },
        {
          prop: "tpCamera",
          name: "监控设备",
          icon: "iconfont XXX",
          value: false,
        },
      ],
    },
  ],
};

// console.log(Object.keys(metaConfig));
// console.log(metaConfig["路产"]);
// console.log(metaConfig["路产"] === metaConfig["路产"])
// console.log(metaConfig["路网"]["国"])

// 根据map metaConfig中的桥梁,隧道,涵洞,路产 key,获取每一项，并遍历每一项的children,取出children中每子级中的name属性，生成映射关系的对象
function generateAmapMakersManage() {
  // 桥梁,隧道,涵洞,路产
  let metaConfigMap = {};
  Object.keys(metaConfig).forEach((key) => {
    if (key === "路网") {
      return;
    } else {
      metaConfigMap[key] = {};
      metaConfig[key].forEach((item) => {
        metaConfigMap[key][item.name] = {};
        item.children &&
          item.children.forEach((child) => {
            if (child.prop) {
              metaConfigMap[key][item.name][child.prop] = [];
            } else {
              metaConfigMap[key][item.name][child.name] = [];
            }
          });
      });
    }
  });
  // console.log(metaConfigMap)
  return metaConfigMap;

  // { '桥梁':
  //  { '桥梁评定等级': { '一类': [], '二类': [], '三类': [], '四类': [], '五类': [] },
  //    '桥梁分类（长度）': { '特大桥': [], '大桥': [], '中桥': [], '小桥': [] } },
  // '隧道':
  //  { '隧道评定等级': { '一类': [], '二类': [], '三类': [], '四类': [], '五类': [] },
  //    '隧道分类（长度）': { '特大隧道': [], '大隧道': [], '中隧道': [], '小隧道': [] } },
  // '涵洞':
  //  { '涵洞位置': { '主线涵洞': [], '匝道涵洞': [] },
  //    '行政等级': { '县道': [], '乡道': [], '村道': [], '专用公路': [] } },
  // '路产':
  //  { '服务设施1':
  //     { tpLabel: [],
  //       tpMarking: [],
  //       tpGuardrail: [],
  //       tpSavefacilities: [],
  //       tpLighting: [],
  //       tpDrainage: [] },
  //    '服务设施2':
  //     { tpTollStation: [],
  //       tpSst: [],
  //       tpPetrolStation: [],
  //       tpParkingLot: [] },
  //     '管理设施': { tpSuper: [], tpStation: [], tpPlate: [], tpCamera: [] }
  //   }
  // }
}
// generateAmapMakersManage()

export { metaConfig };

export default { metaConfig };
