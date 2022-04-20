let metaConfig = new Map([
  // ['keys', [
  //   '路网','桥梁','隧道','涵洞','路产'
  // ]],
  [
    "路网",
    [
      {
        name: "路网",
        icon: "iconfont XXX",
        headLine: true,
        headLineCheckBox: false, // 控制复选框是否显示
        value: false, // 控制复选框的值
        childrenMultiple: false, // 是否支持显示多个子级,定义子级勾选时是否互斥，默认和headLineCheckBox一致
        // 国省县乡村
        children: [
          {
            name: "国道",
            layerName:'map:LX_G',
            icon: "iconfont XXX",
            style: { color: "#191970", width: 2 },
            value: false,
          },
          {
            name: "省道",
            layerName:'map:LX_S',
            icon: "iconfont XXX",
            style: { color: "#191970", width: 2 },
            value: false,
          },
          {
            name: "县道",
            layerName:'map:LX_X',
            icon: "iconfont XXX",
            style: { color: "#191970", width: 2 },
            value: false,
          },
          {
            name: "乡道",
            layerName:'map:LX_Y',
            icon: "iconfont XXX",
            style: { color: "#191970", width: 2 },
            value: false,
          },
          {
            name: "村道",
            layerName:'map:LX_C',
            icon: "iconfont XXX",
            style: { color: "#191970", width: 2 },
            value: false,
          },
        ],
      },
    ],
  ],
  [
    "桥梁",
    [
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
  ],
  [
    "隧道",
    [
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
  ],
  [
    "涵洞",
    [
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
  ],
  [
    "路产",
    [
      // 服务设施，服务设施，管理设施
      {
        name: "服务设施",
        icon: "iconfont XXX",
        headLine: true,
        headLineCheckBox: true,
        value: false,
        childrenMultiple: true,
        // 交通标志，标线，护栏，防护设施，照明设施，排水设施
        children: [
          { name: "交通标志", icon: "iconfont XXX", value: false },
          { name: "标线", icon: "iconfont XXX", value: false },
          { name: "护栏", icon: "iconfont XXX", value: false },
          { name: "防护设施", icon: "iconfont XXX", value: false },
          { name: "照明设施", icon: "iconfont XXX", value: false },
          { name: "排水设施", icon: "iconfont XXX", value: false },
        ],
      },
      {
        name: "服务设施",
        icon: "iconfont XXX",
        headLine: true,
        headLineCheckBox: true,
        value: false,
        childrenMultiple: true,
        // 收费站，服务站，加油站，停车区
        children: [
          { name: "收费站", icon: "iconfont XXX", value: false },
          { name: "服务站", icon: "iconfont XXX", value: false },
          { name: "加油站", icon: "iconfont XXX", value: false },
          { name: "停车区", icon: "iconfont XXX", value: false },
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
          { name: "治超站点", icon: "iconfont XXX", value: false },
          { name: "公路管理站", icon: "iconfont XXX", value: false },
          { name: "桥梁养护牌", icon: "iconfont XXX", value: false },
          { name: "监控设备", icon: "iconfont XXX", value: false },
        ],
      },
    ],
  ],
]);

// console.log(metaConfig.keys());
// console.log(metaConfig.get("路产"));
// console.log(metaConfig.get("路产") === metaConfig.get("路产"))
// console.log(metaConfig.get("路网")["国"])
export { metaConfig };

export default { metaConfig };
