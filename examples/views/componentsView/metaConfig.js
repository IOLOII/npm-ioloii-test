let metaConfig = {
  人员: [
    {
      name: "相关人员",
      icon: "icon-lianjie",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      prop: "相关人员",
      children: [
        {
          name: "巡查人员",
          icon: "iconfont 一类",
          value: false,
          相关人员Value: "01",
        },
        {
          name: "养护人员",
          icon: "iconfont XXX",
          value: false,
          相关人员Value: "02",
        },
        {
          name: "县道路长",
          icon: "iconfont XXX",
          value: false,
          相关人员Value: "03",
        },
        {
          name: "乡道路长",
          icon: "iconfont XXX",
          value: false,
          相关人员Value: "04",
        },
        {
          name: "村道路长",
          icon: "iconfont XXX",
          value: false,
          相关人员Value: "05",
        },
        {
          name: "路政人员",
          icon: "iconfont XXX",
          value: false,
          相关人员Value: "05",
        },
      ],
    },
  ],
  机构: [
    {
      name: "相关机构",
      icon: "icon-WIFI",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      prop: "相关机构",
      children: [
        {
          name: "公路局",
          icon: "iconfont XXX",
          value: false,
          相关机构Value: "01",
        },
        {
          name: "县级路长办公室",
          icon: "iconfont XXX",
          value: false,
          相关机构Value: "02",
        },
        {
          name: "乡级路长办公室",
          icon: "iconfont XXX",
          value: false,
          相关机构Value: "03",
        },
      ],
    },
  ],

  车辆: [
    {
      name: "作业车辆",
      icon: "icon-chongdianzhuang",
      headLine: true,
      headLineCheckBox: true,
      value: false,
      childrenMultiple: true,
      prop: "作业车辆",
      children: [
        {
          name: "巡查车辆",
          icon: "iconfont XXX",
          value: false,
          作业车辆Value: "01",
        },
      ],
    },
  ],
  类型事件: [
    {
      name: "日常保洁",
      icon: "icon-WIFI",
      headLine: true,
      headLineCheckBox: false,
      value: false,
      childrenMultiple: false,
      prop: "event_type",
      children: [
        {
          name: "路面",
          icon: "icon-chuzuche",
          value: false,
          prop: "big_type",
          big_type: "路面",
        },
        {
          name: "路肩",
          icon: "icon-jiaoyi",
          value: false,
          prop: "big_type",
          big_type: "路肩",
        },
        {
          name: "路堤与路床",
          icon: "icon-biaoji",
          value: false,
          prop: "big_type",
          big_type: "路堤与路床",
        },
        {
          name: "边坡",
          icon: "icon-yinhangjigou",
          value: false,
          prop: "big_type",
          big_type: "边坡",
        },
        {
          name: "防护及支挡结构",
          icon: "icon-daohang",
          value: false,
          prop: "big_type",
          big_type: "防护及支挡结构",
        },
        {
          name: "排水设施",
          icon: "icon-qiche",
          value: false,
          prop: "big_type",
          big_type: "排水设施",
        },
        {
          name: "桥梁",
          icon: "icon-qiche",
          value: false,
          prop: "big_type",
          big_type: "桥梁",
        },
        {
          name: "隧道",
          icon: "icon-qiche",
          value: false,
          prop: "big_type",
          big_type: "隧道",
        },
      ],
    },
    // {
    //   name: "小修保养",
    //   icon: "icon-WIFI",
    //   headLine: true,
    //   headLineCheckBox: true,
    //   value: false,
    //   childrenMultiple: true,
    //   prop: "小修保养",
    //   children: [
    //     {
    //       name: "路面",
    //       icon: "icon-chuzuche",
    //       value: false,
    //       小修保养Value: "路面",
    //     },
    //     {
    //       name: "路肩",
    //       icon: "icon-jiaoyi",
    //       value: false,
    //       小修保养Value: "路肩",
    //     },
    //     {
    //       name: "路堤与路床",
    //       icon: "icon-biaoji",
    //       value: false,
    //       小修保养Value: "路堤与路床",
    //     },
    //     {
    //       name: "边坡",
    //       icon: "icon-yinhangjigou",
    //       value: false,
    //       小修保养Value: "边坡",
    //     },
    //     {
    //       name: "防护及支挡结构",
    //       icon: "icon-daohang",
    //       value: false,
    //       小修保养Value: "防护及支挡结构",
    //     },
    //     {
    //       name: "排水设施",
    //       icon: "icon-qiche",
    //       value: false,
    //       小修保养Value: "排水设施",
    //     },
    //     {
    //       name: "桥梁",
    //       icon: "icon-qiche",
    //       value: false,
    //       小修保养Value: "桥梁",
    //     },
    //     {
    //       name: "隧道",
    //       icon: "icon-qiche",
    //       value: false,
    //       小修保养Value: "隧道",
    //     },
    //   ],
    // },
  ],
};

export { metaConfig };

export default { metaConfig };
