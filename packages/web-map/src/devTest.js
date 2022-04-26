import eventBus from "./eventBus";
export default {
  // data() {
  //   return {
  //       amapMakersManage: {
  //         桥梁: {
  //           桥梁评定等级: {
  //             一类: [],
  //             二类: [],
  //             三类: [],
  //             四类: [],
  //             五类: []
  //           },
  //           '桥梁分类（长度）': {
  //             特大桥: [],
  //             大桥: [],
  //             中桥: [],
  //             小桥: []
  //           }
  //         },
  //         隧道: {
  //           隧道评定等级: {
  //             一类: [],
  //             二类: [],
  //             三类: [],
  //             四类: [],
  //             五类: []
  //           },
  //           '隧道分类（长度）': {
  //             特大隧道: [],
  //             大隧道: [],
  //             中隧道: [],
  //             小隧道: []
  //           }
  //         },
  //         涵洞: {
  //           涵洞位置: {
  //             主线涵洞: [],
  //             匝道涵洞: []
  //           },
  //           行政等级: {
  //             县道: [],
  //             乡道: [],
  //             村道: [],
  //             专用公路: []
  //           }
  //         },
  //         路产: {
  //           服务设施1: {
  //             交通标志: [],
  //             标线: [],
  //             护栏: [],
  //             防护设施: [],
  //             照明设施: [],
  //             排水设施: []
  //           },
  //           服务设施2: {
  //             收费站: [],
  //             服务站: [],
  //             加油站: [],
  //             停车区: []
  //           },
  //           管理设施: {
  //             治超站点: [],
  //             公路管理站: [],
  //             桥梁养护牌: [],
  //             监控设备: []
  //           }
  //         }
  //       }
  //   }
  // },
  created() {
    this.initGlobalEvent();
  },
  methods: {
    initGlobalEvent() {
      eventBus.$on("g_click", this.g_click);
      eventBus.$on("suspendedClick", this.suspendedClick);
    },
    g_click(t) {
      this.console(t);
    },
    // suspended
    suspendedClick(direction) {
      this.console(direction);
    },
    /**
     * @deprecated
     * @description 点击复选框
     */
    pickGroupEventHandle({ type, eventObj, value, componentObj, item = null }) {
      let _this = this;
      this.$emit("pickHandle", {
        type,
        eventObj,
        value,
        componentObj,
        item,
        _this,
      });
    },
    // TODO: 地图或外部事件发生后 诱发的顶部区域联动 见 setMetaConfig
    topPickGroupValueSet() {},
    // metaConfigCacheFun(key){
    //   if(this.metaConfigCache[key]) {
    //     return this.metaConfigCache[key]
    //   }else{
    //     this.metaConfigCache[key] = this.metaConfig[key]
    //     return this.metaConfigCache[key]
    //   }
    // }
  },
};
