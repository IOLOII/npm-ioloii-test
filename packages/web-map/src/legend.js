import anime from "animejs";
import eventBus from "./eventBus";
export default {
  data: () => ({
    legend: [], //  按照 amapMakersManage 生成关系
    legendVisible: false,
    // overlays: Object
    // 桥梁: Array(0)
    // 涵洞: Array(0)
    // 路产: Object
    // 隧道: Array(0)
  }),
  watch: {
    legendVisible: {
      handler(v, ov) {
        // anime({
        //   targets: ".legend-wrapper",
        //   easing: "spring(1, 80, 10, 0)",
        //   loop: false,
        //   direction: "normal",
        //   padding: v ? "5px" : 0,
        // });
      },
    },
  },
  created() {
    eventBus.$on("getLegend", ({ emptyObj }) => {
      emptyObj.legend = this.generateAmapLegend()
    });
  },
  methods: {
    generateAmapLegend() {
      if (this.legend && this.legend.length !== 0) return this.legend;
      let legendsKey = Object.keys(this.amapMakersManage); // amapMakersManage : {name:[],name:{}}
      legendsKey.splice(
        Object.keys(this.amapMakersManage).indexOf("overlays"),
        1
      );
      this.console(legendsKey);
      if (legendsKey.length === 0) return; // [key,key]
      let tempLegend = []; //[{name,icon}, {}]
      legendsKey.forEach((key) => {
        if (this.amapMakersManage[key] instanceof Array) {
          tempLegend.push({
            name: key,
            icon: this.metaConfig[key][0].icon,
          });
        } else {
          this.metaConfig[key].forEach(({ children: child }) => {
            child.forEach((item) => {
              tempLegend.push({
                name: item.name,
                icon: item.icon,
              });
            });
          });
        }
      });
      this.legend = tempLegend;
      return tempLegend;
    },
  },
};
