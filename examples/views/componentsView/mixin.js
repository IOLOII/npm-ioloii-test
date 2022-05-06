import eventBus from "./eventBus";
export default {
  data: () => ({
    amapMakersManage: null,
    $AMap: null,
    map: null,
    $WebMap: {},
  }),
  created() {
    eventBus.$on("getProp", ({ emptyObj }) => {
      let { keys } = emptyObj;
      keys.forEach((key) => {
        emptyObj[key] = this[key] || this.$WebMap[key];
      });
    });
    // eventBus.$on("getMetaConfig", ({ emptyObj }) => {
    //   emptyObj.metaConfig = this.metaConfig;
    // });
    eventBus.$on(
      "pickHandle",
      ({ type, eventObj, value, componentObj, item, key }) => {
        this.pickGroupEventHandle({
          type,
          eventObj,
          value,
          componentObj,
          item,
          key,
        });
      }
    );
    // 跨组件调用到webmap
    eventBus.$on("toWebMap", ({ eventName, eventObj = {} }) => {
      this.$WebMap.triggerEvent(eventName, eventObj);
    });
  },
  methods: {
    alert(v) {
      if (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test"
      ) {
        this.console(v);
        return;
      }
      if (typeof v !== "string") {
        this.console(JSON.stringify(v));
      } else {
        alert(v);
      }
    },
    console(v, type = "error") {
      if (
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test"
      ) {
        console[type](v);
      }
    },
    /**
     * @description 加载metaConfig中类别数据 初始化路产数据
     * @param {Object} param
     * @param {Object} param.amapMakersManage 地图标记管理器
     * @param {Object} param.$AMap 地图构造函数
     * @param {Object} param.map 地图实例
     * @param {Object} param.pointEvent 注册交互事件
     */
    getRoadProperty({ amapMakersManage, $AMap, map, pointEvent }) {
      // 路产数据
      const axios = require("axios");
      let data = JSON.stringify({
        administrativeGrade: [],
        areaIds: [],
        culvertLocation: [],
        id: "",
        no: "",
        officeId: "",
        roadNo: "",
        spanType: [],
        stake: "",
        technicalRating: [],
        tunnelTypeCode: [],
        type: [],
      });

      let config = {
        method: "post",
        url: this.tempService + "/api/pc/pcHome/highwayProperty",
        headers: {
          token: this.tempToken,
          "Content-Type": "application/json; charset=utf-8",
        },
        data: data,
      };

      axios(config)
        .then((response) => {
          let arr = [
            { prop: "tpLabel", name: "交通标志" },
            { prop: "tpMarking", name: "标线" },
            { prop: "tpGuardrail", name: "护栏" },
            { prop: "tpSavefacilities", name: "防护设施" },
            { prop: "tpLighting", name: "照明设施" },
            { prop: "tpDrainage", name: "排水设施" },

            { prop: "tpTollStation", name: "收费站" },
            { prop: "tpSst", name: "服务站" },
            { prop: "tpPetrolStation", name: "加油站" },
            { prop: "tpParkingLot", name: "停车区" },

            { prop: "tpSuper", name: "治超站点" },
            { prop: "tpStation", name: "公路管理站" },
            { prop: "tpPlate", name: "桥梁养护牌" },
            { prop: "tpCamera", name: "监控设备" },
          ];
          let obj = {}; // 挂载数据对象
          // let markerCluster = []; // 存放转换后 生成的每一个marker
          let toTransItem = []; // 存放有效点的经纬度数据
          let toTransItemObj = []; // 存放有效点的引用对象
          Object.keys(amapMakersManage["路产"]).forEach((key) => {
            Object.assign(obj, amapMakersManage["路产"][key]);
          });
          arr.forEach(({ prop, name }) => {
            try {
              if (response.data[prop]) {
                response.data[prop] = JSON.parse(
                  decodeURIComponent(response.data[prop])
                );
                console.log(response.data[prop]);
                obj[prop] = response.data[prop].features;
                response.data[prop].features.forEach((point, index) => {
                  point.metaConfigProp = {
                    prop,
                    name,
                  };
                  point.types = name;
                  if (
                    point.geometry &&
                    point.geometry.coordinates[1] &&
                    point.geometry.coordinates[0]
                  ) {
                    toTransItem.push([
                      point.geometry.coordinates[1],
                      point.geometry.coordinates[0],
                    ]);
                    toTransItemObj.push(point);
                  }
                });
              } else {
                response.data[prop] = {};
              }
            } catch (error) {
              this.console("get road property error");
            }
          });
          let promiseArr = [];
          // 生成一个按指定长度切片数组的方法
          function chunk(arr, len) {
            let chunks = [],
              i = 0,
              n = arr.length;
            while (i < n) {
              chunks.push(arr.slice(i, (i += len)));
            }
            return chunks;
          }
          let toTransItemArr = chunk(toTransItem, 1500);
          toTransItemArr.forEach((arr) => {
            let promise = new Promise((resolve, reject) => {
              $AMap.convertFrom(arr, "gps", (status, result) => {
                if (result.info === "ok") {
                  resolve(result.locations);
                } else {
                  reject(result.info);
                }
              });
            });
            promiseArr.push(promise);
          });
          let emptyObj = {
            legend: [],
          };
          eventBus.$emit("getLegend", { emptyObj });
          Promise.all(promiseArr).then((res) => {
            let temparr = [];
            res.map((item) => (temparr = temparr.concat(item)));
            let locations = temparr;

            locations.forEach((item, index) => {
              let point = toTransItemObj[index];
              let legend = emptyObj.legend.find((legendItem) => {
                return legendItem.name === point.metaConfigProp.name;
              });
              let content = `<i class="iconfont ${legend.icon} map-iconfont"></i>`;
              let marker = new $AMap.Marker({
                position: item,
                visible: false,
                map: map,
                content: content,
                offset: new AMap.Pixel(-22, -34),
              });
              // marker.setMap(map); // 开启点聚合 则隐藏
              marker.setExtData(point);
              pointEvent.type.forEach((eType) => {
                marker.on(eType, pointEvent[eType]);
              });
              // markerCluster.push(marker);
              point.marker = marker;
              if (index === 0) {
                console.log("pointmarker", point);
              }
              marker.lnglat = [item.lng, item.lat];
            });

            // TODO: 加载点聚合插件 如果点击全选 加载聚合，否则默认不聚合 仅加载点 可以通过maker控制 点聚合后无法控制
            // map.plugin(["AMap.MarkerCluster"], () => {
            //   let cluster = new $AMap.MarkerCluster(
            //     map,
            //     markerCluster,
            //     {
            //       gridSize: 80, // 聚合网格像素大小
            //     }
            //   );
            //   this.console(cluster)
            // });
          });

          // k=服务设施2 服务设施1 管理设施
          Object.keys(amapMakersManage["路产"]).forEach((k) => {
            Object.keys(amapMakersManage["路产"][k]).forEach((key) => {
              amapMakersManage["路产"][k][key] = obj[key];
            });
          });
        })
        .catch((error) => {
          this.console(error);
        });
    },
    /**
     * @description 路产 元素交互事件
     * @param {Object} $AMap 地图构造函数
     */
    bindRoadRropertyPointEvent($AMap) {
      return {
        type: ["click"], // default click https://lbs.amap.com/api/jsapi-v2/guide/events/map_overlay
        click: (e) => {
          this.loading = true;
          let target = e.target;
          let map = e.target.getMap();
          let ExtData = target.getExtData();
          console.log(ExtData);
          this.$WebMap.triggerEvent("setZoomAndCenter", {
            center: target.lnglat,
            zoom: 17,
          });
          let infoWindow = new $AMap.InfoWindow({
            anchor: "top-left",
            autoMove: true,
            content: ExtData.types + "： " + ExtData.properties.name,
          });
          infoWindow.open(map, target.lnglat);
          infoWindow.on("close", () => {
            // if (process.env.NODE_ENV === "production") {
            //   map.setCenter(this.$WebMap.mapOptions.center);
            // }
            // map.setZoom(this.$WebMap.mapOptions.zoom, false, 500);
            // this.$WebMap.triggerEvent("setZoomAndCenter", {
            //   center: this.$WebMap.mapOptions.center,
            //   zoom: this.$WebMap.mapOptions.center,
            // });
            this.$WebMap.triggerEvent("setZoom");
          });

          const axios = require("axios");
          console.log(ExtData);
          // this.loading = false
          // return
          let config = {
            method: "get",
            headers: {
              token: this.tempToken,
            },
            params: {
              id: ExtData.properties.id,
            },
          };
          console.log(ExtData);
          switch (ExtData.types) {
            case "交通标志":
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpLabele/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 照片 √
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">中心桩号</span>
                        <span class="value">${data.bridgeStake || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "标线":
              config = Object.assign(config, {
                url: this.tempService + "/roadbase/marking/tpMarking/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 照片 ×
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">起点桩号</span>
                        <span class="value">起点桩号</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">讫点桩号</span>
                        <span class="value">讫点桩号</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">中线宽度</span>
                        <span class="value">${
                          data.centerlineWidth
                            ? data.centerlineWidth + " (mm)"
                            : "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">车道线宽度</span>
                        <span class="value">${
                          data.lanelineWidth
                            ? data.lanelineWidth + " (mm)"
                            : "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">边线宽度</span>
                        <span class="value">${
                          data.sidelineWidth
                            ? data.sidelineWidth + " (mm)"
                            : "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">修建日期</span>
                        <span class="value">${data.buildDate || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">标线位置</span>
                        <span class="value">${data.location || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "护栏":
              config = Object.assign(config, {
                url:
                  this.tempService +
                  "/roadbase/guardrail/tpGuardrail/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 照片 ×
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">起点桩号</span>
                        <span class="value">起点桩号</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">讫点桩号</span>
                        <span class="value">讫点桩号</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">护栏长度</span>
                        <span class="value">${
                          data.guardrailWidth
                            ? data.guardrailWidth + " (mm)"
                            : "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">护栏高度</span>
                        <span class="value">${
                          data.guardrailHeight
                            ? data.guardrailHeight + " (mm)"
                            : "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">护栏类型</span>
                        <span class="value">${
                          data.guardrailType || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">防撞等级</span>
                        <span class="value">${
                          data.guardrailGrade || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">修建日期</span>
                        <span class="value">${data.buildDate || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">护栏位置</span>
                        <span class="value">${data.location || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "防护设施":
              config = Object.assign(config, {
                url:
                  this.tempService +
                  "/roadbase/savefacilities/tpSavefacilities/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 照片 ×
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">起点桩号</span>
                        <span class="value">起点桩号</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">讫点桩号</span>
                        <span class="value">讫点桩号</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">方向</span>
                        <span class="value">${
                          {
                            "01": "双向",
                            "02": "上行",
                            "03": "下行",
                          }[data.direction] || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">修建日期</span>
                        <span class="value">${data.buildDate || "暂无"}</span>
                      </div>
                    `;

                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">设施位置</span>
                        <span class="value">${data.location || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    if (data.note) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">备注</span>
                        <span class="value">${data.note || "暂无"}</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "照明设施":
              config = Object.assign(config, {
                url:
                  this.tempService + "/roadbase/lighting/tpLighting/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 照片 ×
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">起点桩号</span>
                        <span class="value">起点桩号</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">讫点桩号</span>
                        <span class="value">讫点桩号</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">修建日期</span>
                        <span class="value">${data.buildDate || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">设施位置</span>
                        <span class="value">${data.location || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    if (data.note) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">备注</span>
                        <span class="value">${data.note || "暂无"}</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "排水设施":
              config = Object.assign(config, {
                url:
                  this.tempService + "/roadbase/drainage/tpDrainage/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 照片 ×
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">起点桩号</span>
                        <span class="value">起点桩号</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">讫点桩号</span>
                        <span class="value">讫点桩号</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">修建日期</span>
                        <span class="value">${data.buildDate || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">设施位置</span>
                        <span class="value">${data.location || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    if (data.note) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">备注</span>
                        <span class="value">${data.note || "暂无"}</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "收费站":
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpTollStation/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 照片 ×
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">中心桩号</span>
                        <span class="value">${data.stake || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">收费金额</span>
                        <span class="value">${data.cost || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">收费性质</span>
                        <span class="value">${
                          data.chargeProperties || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "服务站":
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpSst/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 照片 √
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">占地面积</span>
                        <span class="value">${
                          data.floorArea ? data.floorArea + " (m²)" : "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    if (data.parkingNumLarge) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">大型车位</span>
                        <span class="value">${
                          data.parkingNumLarge || "暂无"
                        }</span>
                      </div>
                    `;
                    }
                    if (data.parkingNumSmall) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">小型车位</span>
                        <span class="value">${
                          data.parkingNumSmall || "暂无"
                        }</span>
                      </div>
                    `;
                    }
                    if (data.location) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">位置</span>
                        <span class="value">${data.location || "暂无"}</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "加油站":
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpPetrolStation/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 照片 √
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    if (data.location) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">位置</span>
                        <span class="value">${data.location || "暂无"}</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "停车区":
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpPetrolStation/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 照片 √
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">负责人</span>
                        <span class="value">负责人</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    if (data.location) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">位置</span>
                        <span class="value">${data.location || "暂无"}</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "治超站点":
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpSuper/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // thumbnail 缩略图 √
                    this.teleportStaticHTML += `
                      ${
                        data.thumbnail ? "<imgsrc=" + data.thumbnail + "/>" : ""
                      }
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">中心桩号</span>
                        <span class="value">${data.stake || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">公路等级</span>
                        <span class="value">${
                          data.highwayClassification || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">左右幅</span>
                        <span class="value">${
                          { 0: "左幅", 1: "右幅", 2: "全幅" }[
                            data.aboutPainting
                          ] || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">建设车道数</span>
                        <span class="value">${data.laneNumber || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    if (data.note) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">备注</span>
                        <span class="value">${data.note || "暂无"}</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "公路管理站":
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpStation/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 缩略图 √
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">站长</span>
                        <span class="value">${data.webmaster || "暂无"}</span>
                      </div>
                    `;
                    if (data.phone) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">联系电话</span>
                        <span class="value">${data.phone || "暂无"}</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    if (data.note) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">备注</span>
                        <span class="value">${data.note || "暂无"}</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "桥梁养护牌":
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpPlate/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 照片 √
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">中心桩号</span>
                        <span class="value">${data.centerStake || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">方向</span>
                        <span class="value">${
                          {
                            "01": "双向",
                            "02": "上行",
                            "03": "下行",
                          }[data.direction] || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">修建日期</span>
                        <span class="value">${data.buildDate || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    if (data.note) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">备注</span>
                        <span class="value">${data.note || "暂无"}</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "监控设备":
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpCamera/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 缩略图 √
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线名称</span>
                        <span class="value">${data.roadName || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">中心桩号</span>
                        <span class="value">中心桩号</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">SIM卡</span>
                        <span class="value">${data.sim || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">设备序列号</span>
                        <span class="value">${
                          data.serialNumber || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    if (data.location) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">位置</span>
                        <span class="value">${data.location || "暂无"}</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
          }
        },
      };
    },
    /**
     * @description 加载metaConfig中类别数据 桥梁bridge 隧道Tunnel 涵洞culvert
     */
    get_Culvert_Bridge_Tunnel({
      amapMakersManage,
      $AMap,
      map,
      pointEvent = null,
      params = {},
      key,
    }) {
      const axios = require("axios");
      let data = JSON.stringify(
        Object.assign(
          {
            administrativeGrade: [],
            areaIds: [],
            culvertLocation: [],
            id: "",
            no: "",
            officeId: "",
            roadNo: "",
            spanType: [],
            stake: "",
            technicalRating: [],
            tunnelTypeCode: [],
            type: [key],
          },
          params
        )
      );

      let config = {
        method: "post",
        url: this.tempService + "/api/pc/pcHome/queryHomePoint",
        headers: {
          token: this.tempToken,
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(config)
        .then((response) => {
          let toTransItem = []; // 存放有效点的经纬度数据
          let toTransItemObj = []; // 存放有效点的引用对象
          response.data.forEach((item) => {
            item = JSON.parse(decodeURIComponent(item));
            item.features.forEach((point, index) => {
              if (
                point.geometry &&
                point.geometry.coordinates[1] &&
                point.geometry.coordinates[0]
              ) {
                toTransItem.push([
                  point.geometry.coordinates[1],
                  point.geometry.coordinates[0],
                ]);
                toTransItemObj.push(point);
              }
            });
          });

          let promiseArr = [];
          // 生成一个按指定长度切片数组的方法
          function chunk(arr, len) {
            let chunks = [],
              i = 0,
              n = arr.length;
            while (i < n) {
              chunks.push(arr.slice(i, (i += len)));
            }
            return chunks;
          }
          let toTransItemArr = chunk(toTransItem, 1500);
          toTransItemArr.forEach((arr) => {
            let promise = new Promise((resolve, reject) => {
              $AMap.convertFrom(arr, "gps", (status, result) => {
                if (result.info === "ok") {
                  resolve(result.locations);
                } else {
                  reject(result.info);
                }
              });
            });
            promiseArr.push(promise);
          });
          let emptyObj = {
            legend: [],
          };
          eventBus.$emit("getLegend", { emptyObj });
          Promise.all(promiseArr)
            .then((res) => {
              let temparr = [];
              res.map((item) => (temparr = temparr.concat(item)));
              let locations = temparr;
              // if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === 'test') {
              //   locations = [temparr[0]];
              // }
              locations.forEach((item, index) => {
                let point = toTransItemObj[index];
                point.types = key;
                let legend = emptyObj.legend.find((legendItem) => {
                  return legendItem.name === key;
                });
                let content = `<i class="iconfont ${legend.icon} map-iconfont"></i>`;
                let marker = new $AMap.Marker({
                  position: item,
                  // visible: false,
                  map: map,
                  content: content,
                  offset: new AMap.Pixel(-22, -34),
                });
                marker.setExtData(point);
                pointEvent &&
                  pointEvent.type.forEach((eType) => {
                    marker.on(eType, pointEvent[eType]);
                  });
                point.marker = marker;
                if (index === 0) {
                  console.log("pointmarker", point);
                }
                marker.lnglat = [item.lng, item.lat];
              });

              amapMakersManage[key] = toTransItemObj;
            })
            .catch((err) => this.console(err));
        })
        .catch((error) => {
          this.console("get Culvert_Bridge_Tunnel error");
        });
    },
    /**
     * @description 业务 元素交互事件
     * @param {Object} $AMap 地图构造函数
     */
    bind_Culvert_Bridge_Tunnel($AMap) {
      return {
        type: ["click"], // default click
        click: (e) => {
          this.loading = true;
          let target = e.target;
          let map = e.target.getMap();
          let ExtData = target.getExtData();
          // console.log(ExtData);
          // console.log(target);
          this.$WebMap.triggerEvent("setZoomAndCenter", {
            center: target.lnglat,
            zoom: 17,
          });
          let infoWindow = new $AMap.InfoWindow({
            anchor: "top-left",
            autoMove: true,
            content: ExtData.types + "： " + ExtData.properties.name,
          });
          infoWindow.open(map, target.lnglat);
          infoWindow.on("close", () => {
            // if (process.env.NODE_ENV === "production") {
            //   map.setCenter(this.$WebMap.mapOptions.center);
            // }
            // map.setZoom(this.$WebMap.mapOptions.zoom, false, 500);
            // this.$WebMap.triggerEvent("setZoomAndCenter", {
            //   center: this.$WebMap.mapOptions.center,
            //   zoom: this.$WebMap.mapOptions.center,
            // });
            this.$WebMap.triggerEvent("setZoom");
          });

          // 增加请求获取数据
          const axios = require("axios");
          let config = {
            method: "get",
            headers: {
              token: this.tempToken,
            },
            params: {
              id: ExtData.properties.id,
            },
          };
          console.log(ExtData);
          switch (ExtData.types) {
            case "桥梁":
              // case '桥梁评定等级':
              // case '桥梁分类（长度）':
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpBridge/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // thumbnail 缩略图
                    // positivePhoto 桥梁正面照 √
                    this.teleportStaticHTML += `
                      ${
                        data.positivePhoto || data.thumbnail
                          ? "<imgsrc=" +
                            (data.positivePhoto || data.thumbnail) +
                            "/>"
                          : ""
                      }
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">行政等级</span>
                        <span class="value">${
                          {
                            G: "国道",
                            S: "省道",
                            X: "县道",
                            Y: "乡道",
                            C: "村道",
                            Z: "专用公路",
                          }[data.regionGrade] || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">桥梁代码</span>
                        <span class="value">${
                          data.bridgeNumber || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">中心桩号</span>
                        <span class="value">${data.bridgeStake || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">按跨径分类</span>
                        <span class="value">${
                          {
                            "01": "特大桥",
                            "02": "大桥",
                            "03": "中桥",
                            "04": "小桥",
                          }[data.spanType] || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">使用年限分类</span>
                        <span class="value">${
                          { "01": "永久性", "02": "半永久性", "03": "临时性" }[
                            data.classifiedLife
                          ] || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">技术状况等级评定</span>
                        <span class="value">${
                          {
                            "01": "一类",
                            "02": "二类",
                            "03": "三类",
                            "04": "四类",
                            "05": "五类",
                          }[data.technicalRating] || "暂无"
                        }</span>
                      </div>
                    `;
                    if (data.direction) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">--行车方向</span>
                        <span class="value">${
                          {
                            "01": "双向",
                            "02": "上行",
                            "03": "下行",
                          }[data.direction] || "暂无"
                        }</span>
                      </div>
                    `;
                    }
                    if (data.crossType) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">--跨地物类型</span>
                        <span class="value">${data.crossType || "暂无"}</span>
                      </div>
                    `;
                    }
                    if (data.featuresType) {
                      this.teleportStaticHTML += `
                      <div>
                        <span class="key">--功能类型</span>
                        <span class="value">${
                          data.featuresType || "暂无"
                        }</span>
                      </div>
                    `;
                    }
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });

              break;
            case "隧道":
              // case '隧道评定等级':
              // case '隧道分类（长度）':
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpTunnel/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 图片 √
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">行政等级</span>
                        <span class="value">${
                          {
                            G: "国道",
                            S: "省道",
                            X: "县道",
                            Y: "乡道",
                            C: "村道",
                            Z: "专用公路",
                          }[data.regionGrade] || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">隧道代码</span>
                        <span class="value">${data.no || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">中心桩号</span>
                        <span class="value">${data.bridgeStake || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">行车方向</span>
                        <span class="value">${
                          {
                            "01": "双向",
                            "02": "上行",
                            "03": "下行",
                          }[data.direction] || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">按隧道长度分类</span>
                        <span class="value">${
                          {
                            "01": "特大隧道",
                            "02": "大隧道",
                            "03": "中隧道",
                            "04": "小隧道",
                          }[data.tunnelTypeCode] || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">技术状况等级评定</span>
                        <span class="value">技术状况等级评定</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">隧道养护等级</span>
                        <span class="value">${
                          {
                            "01": "一级",
                            "02": "二级",
                            "03": "三级",
                            "04": "四级",
                            "05": "五级",
                          }[data.tunnelLevel] || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">隧道长度</span>
                        <span class="value">${
                          data.tunnelLength
                            ? data.tunnelLength + " (m)"
                            : "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
            case "涵洞":
              // case '涵洞位置':
              // case '行政等级':
              config = Object.assign(config, {
                url: this.tempService + "/tp/tpCulvert/queryById",
              });
              axios(config)
                .then((response) => {
                  let data = response.data;
                  console.log(data);
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    // img 图片 √
                    this.teleportStaticHTML += `
                      ${data.img ? "<imgsrc=" + data.img + "/>" : ""}
                      <div class="group">
                            <span class="title">${ExtData.types} ${
                      ExtData.properties.name
                    }</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">路线编号</span>
                        <span class="value">${data.roadNo || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">行政等级</span>
                        <span class="value">${
                          {
                            G: "国道",
                            S: "省道",
                            X: "县道",
                            Y: "乡道",
                            C: "村道",
                            Z: "专用公路",
                          }[data.regionGrade] || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">中心桩号</span>
                        <span class="value">${data.bridgeStake || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">功能类型</span>
                        <span class="value">${
                          data.typeOfFunction || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">涵洞位置</span>
                        <span class="value">${
                          data.culvertLocation || "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">--涵洞全长</span>
                        <span class="value">${
                          data.culvertOverallLength
                            ? data.culvertOverallLength + " (m)"
                            : "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">--净高</span>
                        <span class="value">${
                          data.clearHeight ? data.clearHeight + " (m)" : "暂无"
                        }</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">管养单位</span>
                        <span class="value">${data.custodyUnit || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属行政区域</span>
                        <span class="value">${data.area.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key">所属机构</span>
                        <span class="value">${data.office.name || "暂无"}</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .catch((error) => {
                  this.$nextTick(() => {
                    this.teleportStaticHTML = `<div class="lineInfo">`;
                    this.teleportStaticHTML += `
                      <div class="group">
                            <span class="title">${ExtData.types} ${ExtData.properties.name}</span>
                    `;
                    this.teleportStaticHTML += `
                      <div>
                        <span class="key"></span>
                        <span class="value">暂无信息</span>
                      </div>
                    `;
                    this.teleportStaticHTML += `</div>`;
                    this.teleportStaticHTML += `</div>`;
                  });
                })
                .finally(() => {
                  this.loading = false;
                  // TODO: 插入其他元素或页面的交互事件
                  // NOTE: 页面其他事件，点渲染，单独维护
                  this.$WebMap.triggerEvent("animeMove", {
                    direction: "right",
                    isShow: true,
                    sideConf: {
                      right: "300px",
                    },
                  });
                });
              break;
          }

          // Object.keys(ExtData.properties).forEach((key) => {
          //   this.teleportStaticHTML += `
          //     <div>
          //       <span class="key">${key}</span>
          //       <span class="value"> ${ExtData.properties[key]}</span>
          //     </div>

          //   `;
          // });
        },
      };
    },
    /**
     * @description 生成 amapMakersManage 地图标记管理器-高德元素
     */
    generateAmapMakersManage({ emptyObj, metaConfig }) {
      if (
        this.$amapMakersManage &&
        JSON.stringify(this.$amapMakersManage) !== "{}"
      ) {
        this.console("amapMakersManage is not empty");
        emptyObj.amapMakersManage = metaConfigMap;
        return;
      }
      // 桥梁,隧道,涵洞,路产
      let metaConfigMap = {};
      metaConfigMap.overlays = {}; // 预留 非metaConfig 配置中使用的地图功能
      Object.keys(metaConfig).forEach((key) => {
        switch (key) {
          case "路网":
            break;
          case "桥梁":
          case "隧道":
          case "涵洞":
            metaConfigMap[key] = []; // 涵洞 等大类下的所有小类的组合查询分别只返回一个类型的数据
            break;
          case "路产":
            metaConfigMap[key] = {}; // 路产大类下的每个小类分别是一种类型的数据
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
            break;
        }
      });
      emptyObj.amapMakersManage = metaConfigMap;
    },
  },
};
