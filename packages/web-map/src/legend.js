export default {
  data: () => ({
    legend: {}, //  按照 amapMakersManage 生成关系

    // overlays: Object
    // 桥梁: Array(0)
    // 涵洞: Array(0)
    // 路产: Object
    // 隧道: Array(0)
  }),
  computed: {
    showLegend() {},
  },
  created() {
    console.log(this);
  },
  methods: {
    generateAmapLegend() {
      let legendsKey = Object.keys(this.amapMakersManage);
      legendsKey.splice(
        Object.keys(this.amapMakersManage).indexOf("overlays"),
        1
      );
      this.console(legendsKey);
      if (legendsKey.length === 0) return;
      let tempLegend = {};
      legendsKey.forEach((key, x) => {
        switch (this.amapMakersManage[key] instanceof Array) {
          case true:
            tempLegend[x] = {};
            tempLegend[x].name = key;
            tempLegend[x].children = [];
            [this.metaConfig[key][0]].forEach((item) => {
              tempLegend[x].children.push({
                icon: item.icon,
                name: key,
              });
            });
            break;
          case false:
            tempLegend[x] = {};
            tempLegend[x].name = key;
            tempLegend[x].children = [];
            this.metaConfig[key].forEach((item) => {
              if (!item.children) return;
              item.children.forEach((componentObj) => {
                if (!item.children) return;
                tempLegend[x].children.push({
                  icon: componentObj.icon,
                  name: componentObj.name,
                });
              });
            });
            break;
        }
      });
      console.log(tempLegend);
      this.legend = tempLegend;
    },
  },
};
