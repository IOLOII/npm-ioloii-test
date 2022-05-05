let metaConfig = {
  路网: [
    {
      name: "路网",
      icon: "iconfont 路网",
      headLine: true,
      headLineCheckBox: true, // 控制复选框是否显示
      value: false, // 控制复选框的值
      childrenMultiple: true, // 是否支持显示多个子级,定义子级勾选时是否互斥，默认和headLineCheckBox一致
      // 国省县乡村
      children: [
        {
          name: "国道",
          layerName: "neimenggu:nm_eeds_gd",
          icon: "iconfont 国道",
          style: { color: "#191970", width: 2 },
          value: false,
        },
        {
          name: "省道",
          layerName: "neimenggu:nm_eeds_sd",
          icon: "iconfont 省道",
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
      icon: "icon-lianjie",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      prop:'technicalRating',
      // 一类，二类，三类，四类，五类
      children: [
        { name: "一类", icon: "iconfont 一类", value: false ,technicalRatingValue:'01'},
        { name: "二类", icon: "iconfont XXX", value: false ,technicalRatingValue:'02'},
        { name: "三类", icon: "iconfont XXX", value: false ,technicalRatingValue:'03'},
        { name: "四类", icon: "iconfont XXX", value: false ,technicalRatingValue:'04'},
        { name: "五类", icon: "iconfont XXX", value: false ,technicalRatingValue:'05'},
      ],
    },
    {
      name: "桥梁分类（长度）",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      prop:'spanType',
      children: [
        // 特大桥，大桥，中桥，小桥
        { name: "特大桥", icon: "iconfont XXX", value: false,spanTypeValue:'01' },
        { name: "大桥", icon: "iconfont XXX", value: false,spanTypeValue:'02' },
        { name: "中桥", icon: "iconfont XXX", value: false,spanTypeValue:'03' },
        { name: "小桥", icon: "iconfont XXX", value: false,spanTypeValue:'04' },
      ],
    },
  ],
  隧道: [
    {
      name: "隧道评定等级",
      icon: "icon-WIFI",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      prop:'technicalRating',
      // 一类，二类，三类，四类，五类
      children: [
        { name: "一类", icon: "iconfont XXX", value: false , technicalRatingValue:'01'},
        { name: "二类", icon: "iconfont XXX", value: false , technicalRatingValue:'02'},
        { name: "三类", icon: "iconfont XXX", value: false , technicalRatingValue:'03'},
        { name: "四类", icon: "iconfont XXX", value: false , technicalRatingValue:'04'},
        { name: "五类", icon: "iconfont XXX", value: false , technicalRatingValue:'05'},
      ],
    },
    {
      name: "隧道分类（长度）",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      prop:'tunnelTypeCode', // 隧道分类(01:特长隧道;02长隧道;03中隧道;04短隧道)
      children: [
        // 特大隧道，大隧道，中隧道，小隧道
        { name: "特大隧道", icon: "iconfont XXX", value: false,tunnelTypeCodeValue:'01' },
        { name: "大隧道", icon: "iconfont XXX", value: false,tunnelTypeCodeValue:'02' },
        { name: "中隧道", icon: "iconfont XXX", value: false,tunnelTypeCodeValue:'03' },
        { name: "小隧道", icon: "iconfont XXX", value: false,tunnelTypeCodeValue:'04' },
      ],
    },
  ],

  涵洞: [
    {
      name: "涵洞位置",
      icon: "icon-chongdianzhuang",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      prop: "culvertLocation", // 查询条件 涵洞位置(01,主线涵洞,02匝道涵洞)
      // 主线涵洞，匝道涵洞
      children: [
        {
          name: "主线涵洞",
          icon: "iconfont XXX",
          value: false,
          culvertLocationValue: "01",
        },
        {
          name: "匝道涵洞",
          icon: "iconfont XXX",
          value: false,
          culvertLocationValue: "02",
        },
      ],
    },
    {
      name: "行政等级",
      icon: "iconfont XXX",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      prop: "administrativeGrade", // 查询条件 行政等级(国道G,省道S,县道X,乡道Y,村道C,专用公路Z)
      // 县道，乡道，村道，专用公路
      children: [
        {
          name: "县道",
          icon: "iconfont XXX",
          value: false,
          administrativeGradeValue: "X",
        },
        {
          name: "乡道",
          icon: "iconfont XXX",
          value: false,
          administrativeGradeValue: "Y",
        },
        {
          name: "村道",
          icon: "iconfont XXX",
          value: false,
          administrativeGradeValue: "C",
        },
        {
          name: "专用公路",
          icon: "iconfont XXX",
          value: false,
          administrativeGradeValue: "Z",
        },
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
          icon: "icon-chuzuche",
          value: false,
        },
        { prop: "tpMarking", name: "标线", icon: "icon-jiaoyi", value: false },
        {
          prop: "tpGuardrail",
          name: "护栏",
          icon: "icon-biaoji",
          value: false,
        },
        {
          prop: "tpSavefacilities",
          name: "防护设施",
          icon: "icon-yinhangjigou",
          value: false,
        },
        {
          prop: "tpLighting",
          name: "照明设施",
          icon: "icon-daohang",
          value: false,
        },
        {
          prop: "tpDrainage",
          name: "排水设施",
          icon: "icon-qiche",
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
          icon: "icon-jiayouzhan",
          value: false,
        },
        { prop: "tpSst", name: "服务站", icon: "icon-tingchechang", value: false },
        {
          prop: "tpPetrolStation",
          name: "加油站",
          icon: "icon-jiayou",
          value: false,
        },
        {
          prop: "tpParkingLot",
          name: "停车区",
          icon: "icon-qiche",
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
          icon: "icon-lianjie",
          value: false,
        },
        {
          prop: "tpStation",
          name: "公路管理站",
          icon: "icon-chongdianzhuang",
          value: false,
        },
        {
          prop: "tpPlate",
          name: "桥梁养护牌",
          icon: "icon-yinhangjigou",
          value: false,
        },
        {
          prop: "tpCamera",
          name: "监控设备",
          icon: "icon-tingchechang",
          value: false,
        },
      ],
    },
  ],
};

export { metaConfig };

export default { metaConfig };
