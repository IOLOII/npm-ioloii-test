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
      if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === 'test') {
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
      if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === 'test') {
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
                obj[prop] = response.data[prop].features;
                response.data[prop].features.forEach((point, index) => {
                  point.metaConfigProp = {
                    prop,
                    name,
                  };
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
            content: ExtData.properties.name,
          });
          infoWindow.open(map, target.lnglat);
          infoWindow.on("close", () => {
            if (process.env.NODE_ENV === "production") {
              map.setCenter(this.$WebMap.mapOptions.center);
            }
            map.setZoom(this.$WebMap.mapOptions.zoom, false, 500);
          });

          // TODO: 插入其他元素或页面的交互事件
          // NOTE: 页面其他事件，点渲染，单独维护
          this.$WebMap.triggerEvent("animeMove", {
            direction: "right",
            isShow: true,
            sideConf: {
              right: "300px",
            },
          });
          this.$nextTick(() => {
            this.teleportStaticHTML = `<div class="lineInfo">`;
            this.teleportStaticHTML += `
              <img
                src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.xmsouhu.com%2Fd%2Ffile%2Ftupian%2Fbizhi%2F2020-06-01%2F941ca540f4833b39f34ca7af18860200.jpg&refer=http%3A%2F%2Fwww.xmsouhu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1653122631&t=44faeba24c47aa661db1a6d71bfd80da"
              />
              <div class="group">
                    <span class="title">点位信息</span>
            `;
            this.teleportStaticHTML += `
              <div>
                <span class="key">名称</span>
                <span class="value"> ${ExtData.properties["name"]}</span>
              </div>
            `;
            // Object.keys(ExtData.properties).forEach((key) => {
            //   this.teleportStaticHTML += `
            //     <div>
            //       <span class="key">${key}</span>
            //       <span class="value"> ${ExtData.properties[key]}</span>
            //     </div>

            //   `;
            // });
            this.teleportStaticHTML += `</div>`;
            this.teleportStaticHTML += `</div>`;
          });
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
            content: ExtData.properties.name,
          });
          infoWindow.open(map, target.lnglat);
          infoWindow.on("close", () => {
            if (process.env.NODE_ENV === "production") {
              map.setCenter(this.$WebMap.mapOptions.center);
            }
            map.setZoom(this.$WebMap.mapOptions.zoom, false, 500);
          });

          // TODO: 插入其他元素或页面的交互事件
          // NOTE: 页面其他事件，点渲染，单独维护
          this.$WebMap.triggerEvent("animeMove", {
            direction: "right",
            isShow: true,
            sideConf: {
              right: "300px",
            },
          });
          this.$nextTick(() => {
            this.teleportStaticHTML = `<div class="lineInfo">`;
            this.teleportStaticHTML += `
              <img
                src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.xmsouhu.com%2Fd%2Ffile%2Ftupian%2Fbizhi%2F2020-06-01%2F941ca540f4833b39f34ca7af18860200.jpg&refer=http%3A%2F%2Fwww.xmsouhu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1653122631&t=44faeba24c47aa661db1a6d71bfd80da"
              />
              <div class="group">
                    <span class="title">点位信息</span>
            `;
            // Object.keys(ExtData.properties).forEach((key) => {
            //   this.teleportStaticHTML += `
            //     <div>
            //       <span class="key">${key}</span>
            //       <span class="value"> ${ExtData.properties[key]}</span>
            //     </div>

            //   `;
            // });
            this.teleportStaticHTML += `
              <div>
                <span class="key">${ExtData.properties["tableType"]}名称</span>
                <span class="value"> ${ExtData.properties["name"]}</span>
              </div>
            `;
            this.teleportStaticHTML += `</div>`;
            this.teleportStaticHTML += `</div>`;
          });
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
