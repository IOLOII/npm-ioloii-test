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
    eventBus.$on("draw", ({ eventName, eventObj = {} }) => {
      this.draw({ eventName, eventObj });
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
     * @description 加载metaConfig中类别数据 初始化养护数据-类型事件
     * @param {Object} param
     * @param {Object} param.amapMakersManage 地图标记管理器
     * @param {Object} param.$AMap 地图构造函数
     * @param {Object} param.map 地图实例
     * @param {Object} param.pointEvent 注册交互事件
     */
    get_MAINTENANCE_INCIDENT({ amapMakersManage, $AMap, map, pointEvent }) {
      const axios = require("axios");
      let config = {};
      console.log(amapMakersManage);
      Object.keys(amapMakersManage["类型事件"]).forEach((key) => {
        // key = 日常养护
        Object.keys(amapMakersManage["类型事件"][key]).forEach((itemkey) => {
          // itemkey = 路面
          config = {
            method: "get",
            url: this.tempService + "/lzz/mt/mtEvent/list?",
            headers: {
              token: this.tempToken,
              "Content-Type": "application/json; charset=utf-8",
            },
          };
          axios(
            Object.assign(config, {
              params: {
                current: 0,
                size: -1,
                eventType: key,
                bigType: itemkey,
              },
            })
          )
            .then((response) => {
              if (process.env.NODE_ENV === "test") {
                response.data.records.forEach((asdasd, indad) => {
                  if (!asdasd.longitude || !asdasd.latitude) {
                    Object.assign(asdasd, {
                      longitude: 116.313432 + Math.random() * 0.1,
                      latitude: 39.983744 + Math.random() * 0.1,
                    });
                  }
                });
              }
              // PART: 对象转换
              let obj = {}; // 挂载数据对象
              // let markerCluster = []; // 存放转换后 生成的每一个marker
              let toTransItem = []; // 存放有效点的经纬度数据
              let toTransItemObj = []; // 存放有效点的引用对象
              Object.keys(amapMakersManage["类型事件"]).forEach((key) => {
                if (key === itemkey) {
                  Object.assign(obj, amapMakersManage["类型事件"][key]);
                }
              });
              obj[itemkey] = response.data.records;
              response.data.records.forEach((point) => {
                point.metaConfigProp = {
                  prop: point.prop, // TODO: 数据校验
                  big_type: point.big_type,
                  name: itemkey,
                };
                point.types = itemkey;
                if (point.longitude && point.latitude) {
                  toTransItem.push([point.longitude, point.latitude]);
                  toTransItemObj.push(point);
                }
              });
              console.log(`${itemkey} 符合的数据有 ${toTransItem.length}`);

              // PART: 坐标转换
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

              // PART: 图例
              let emptyObj = {
                legend: [],
              };
              eventBus.$emit("getLegend", { emptyObj });

              // PART: 画点
              Promise.all(promiseArr).then((res) => {
                let temparr = [];
                res.map((item) => (temparr = temparr.concat(item)));
                let locations = temparr;

                locations.forEach((item, index) => {
                  let point = toTransItemObj[index];
                  let legend = emptyObj.legend.find((legendItem) => {
                    return legendItem.name === point.metaConfigProp.name;
                  });
                  if (!legend) return;
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
                    // console.log(`pointmarker:${point}`);
                  }
                  marker.lnglat = [item.lng, item.lat];
                });
              });

              Object.keys(amapMakersManage["类型事件"]).forEach((k) => {
                // key = 日常养护
                Object.keys(amapMakersManage["类型事件"][k]).forEach((key) => {
                  // itemkey = 路面
                  if (key === itemkey) {
                    amapMakersManage["类型事件"][k][key] = obj[key];
                  }
                });
              });
            })
            .catch((error) => {
              console.log(error);
            });
        });
      });
      // lzz/mt/mtEvent/list
    },
    /**
     * @description 业务 元素交互事件
     * @param {Object} $AMap 地图构造函数
     */
    bind_MAINTENANCE_INCIDENT($AMap) {
      return {
        type: ["click"], // default click
        click: (e) => {
          // this.loading = true;
          let target = e.target;
          let map = e.target.getMap();
          let ExtData = target.getExtData();
          // console.log(ExtData);
          // console.log(target);
          this.$WebMap.triggerEvent("setZoomAndCenter", {
            // target.lnglat 在加载时添加
            center: target.lnglat || target.getPosition(),
            zoom: 17,
          });
          console.log(ExtData);
          let infoWindow = new $AMap.InfoWindow({
            anchor: "top-left",
            autoMove: true,
            content: ExtData.types, // + ExtData.properties.name,
          });
          infoWindow.open(map, target.lnglat || target.getPosition());
          infoWindow.on("close", () => {
            this.$WebMap.triggerEvent("setZoom");
          });
          return;

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
        },
      };
    },
    /**
     * @description 加载metaConfig中类别数据 初始化养护数据-相关人员
     * @param {Object} param
     * @param {Object} param.amapMakersManage 地图标记管理器
     * @param {Object} param.$AMap 地图构造函数
     * @param {Object} param.map 地图实例
     * @param {Object} param.pointEvent 注册交互事件
     */
    get_MAINTENANCE_PERSON({ amapMakersManage, $AMap, map, pointEvent }) {
      const axios = require("axios");

      let config = {
        method: "get",
        url: this.tempService + "/pl/plDirectories/zhyhPcOnlineOffline",
        headers: {
          token: this.tempToken,
          "Content-Type": "application/json; charset=utf-8",
        },
      };

      axios(config)
        .then((response) => {
          // 根据 onlineOrientation中 roleName对用户区分
          console.log(JSON.stringify(response.data));
          if (process.env.NODE_ENV === "test") {
            response.data.onlineOrientation = [
              {
                areaName: "test",
                contactNumber: "123123",
                directoriesName: "123123",
                longitude: 116.313432,
                latitude: 39.983744,
                patrolTime: "123",
                roleName: "路政人员",
              },
            ];
          }
          // PART: 对象转换
          let obj = {}; // 挂载数据对象
          let toTransItem = []; // 存放有效点的经纬度数据
          let toTransItemObj = []; // 存放有效点的引用对象

          Object.keys(amapMakersManage["人员"]).forEach((key) => {
            Object.assign(obj, amapMakersManage["人员"][key]);
          });
          response.data.onlineOrientation.forEach((point) => {
            point.metaConfigProp = {
              prop: point.roleName,
              name: point.roleName,
            };
            point.types = point.roleName;
            if (point.longitude && point.latitude) {
              toTransItem.push([point.longitude, point.latitude]);
              toTransItemObj.push(point);
              if (obj.hasOwnProperty(point.roleName))
                obj[point.roleName].push(point);
            }
          });
          console.log(`人员 符合的数据有 ${toTransItem.length}`);

          // PART: 坐标转换
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

          // PART: 图例
          let emptyObj = {
            legend: [],
          };
          eventBus.$emit("getLegend", { emptyObj });
          // PART: 画点
          Promise.all(promiseArr).then((res) => {
            let temparr = [];
            res.map((item) => (temparr = temparr.concat(item)));
            let locations = temparr;

            locations.forEach((item, index) => {
              let point = toTransItemObj[index];
              let legend = emptyObj.legend.find((legendItem) => {
                return legendItem.name === point.metaConfigProp.name;
              });
              if (!legend) return;
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
                // console.log("pointmarker", point);
              }
              marker.lnglat = [item.lng, item.lat];
            });
          });

          Object.keys(amapMakersManage["人员"]).forEach((k) => {
            // key = 相关人员
            Object.keys(amapMakersManage["人员"][k]).forEach((key) => {
              amapMakersManage["人员"][k][key] = obj[key];
            });
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },
    /**
     * @description 业务 元素交互事件
     * @param {Object} $AMap 地图构造函数
     */
    bind_MAINTENANCE_PERSON($AMap) {
      return {
        type: ["click"], // default click
        click: (e) => {
          let target = e.target;
          let map = e.target.getMap();
          let ExtData = target.getExtData();
          this.$WebMap.triggerEvent("setZoomAndCenter", {
            // target.lnglat 在加载时添加
            center: target.lnglat || target.getPosition(),
            zoom: 17,
          });
          console.log(ExtData);
          let infoWindow = new $AMap.InfoWindow({
            anchor: "top-left",
            autoMove: true,
            content: ExtData.types, // + ExtData.properties.name,
          });
          infoWindow.open(map, target.lnglat || target.getPosition());
          infoWindow.on("close", () => {
            this.$WebMap.triggerEvent("setZoom");
          });
          return;

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
        },
      };
    },
    /**
     * @description 加载metaConfig中类别数据 初始化养护数据-机构
     * @param {Object} param
     * @param {Object} param.amapMakersManage 地图标记管理器
     * @param {Object} param.$AMap 地图构造函数
     * @param {Object} param.map 地图实例
     * @param {Object} param.pointEvent 注册交互事件
     */
    get_MAINTENANCE_ORGANIZATION({ amapMakersManage, $AMap, map, pointEvent }) {
      const axios = require("axios");

      let config = {
        method: "get",
        url: this.tempService + "/pl/sysOffice/list?current=1&size=-1",
        headers: {
          token: this.tempToken,
          "Content-Type": "application/json; charset=utf-8",
        },
      };

      axios(config)
        .then((response) => {
          // PART: 对象转换
          let obj = {}; // 挂载数据对象
          let toTransItem = []; // 存放有效点的经纬度数据
          let toTransItemObj = []; // 存放有效点的引用对象
          Object.keys(amapMakersManage["机构"]).forEach((key) => {
            Object.assign(obj, amapMakersManage["机构"][key]);
          });
          response.data.records.forEach((point) => {
            point.metaConfigProp = {
              prop: point.name,
              name: point.name,
            };
            point.types = point.name;
            if (point.longitude && point.latitude) {
              toTransItem.push([point.longitude, point.latitude]);
              toTransItemObj.push(point);
              if (obj.hasOwnProperty(point.name)) obj[point.name].push(point);
            }
          });
          console.log(`机构 数据有 ${toTransItem.length}`);
          console.log(`机构 符合的数据有 ${JSON.stringify(obj)}`);
          // PART: 坐标转换
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

          // PART: 图例
          let emptyObj = {
            legend: [],
          };
          eventBus.$emit("getLegend", { emptyObj });
          // PART: 画点
          Promise.all(promiseArr).then((res) => {
            let temparr = [];
            res.map((item) => (temparr = temparr.concat(item)));
            let locations = temparr;

            locations.forEach((item, index) => {
              let point = toTransItemObj[index];
              let legend = emptyObj.legend.find((legendItem) => {
                return legendItem.name === point.metaConfigProp.name;
              });
              if (!legend) return;
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
                // console.log(`pointmarker:${point}`);
              }
              marker.lnglat = [item.lng, item.lat];
            });
          });

          Object.keys(amapMakersManage["机构"]).forEach((k) => {
            // key = 相关机构
            Object.keys(amapMakersManage["机构"][k]).forEach((key) => {
              amapMakersManage["机构"][k][key] = obj[key];
            });
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },
    /**
     * @description 业务 元素交互事件
     * @param {Object} $AMap 地图构造函数
     */
    bind_MAINTENANCE_ORGANIZATION($AMap) {
      return {
        type: ["click"], // default click
        click: (e) => {
          // this.loading = true;
          let target = e.target;
          let map = e.target.getMap();
          let ExtData = target.getExtData();
          // console.log(ExtData);
          // console.log(target);
          this.$WebMap.triggerEvent("setZoomAndCenter", {
            // target.lnglat 在加载时添加
            center: target.lnglat || target.getPosition(),
            zoom: 17,
          });
          console.log(ExtData);
          let infoWindow = new $AMap.InfoWindow({
            anchor: "top-left",
            autoMove: true,
            content: ExtData.types, // + ExtData.properties.name,
          });
          infoWindow.open(map, target.lnglat || target.getPosition());
          infoWindow.on("close", () => {
            this.$WebMap.triggerEvent("setZoom");
          });
          return;

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
          case "类型事件":
            metaConfigMap[key] = {}; // 路产大类下的每个小类分别是一种类型的数据
            metaConfig[key].forEach((item) => {
              metaConfigMap[key][item.name] = {};
              item.children &&
                item.children.forEach((child) => {
                  metaConfigMap[key][item.name][child.name] = [];
                });
            });
            break;
          case "人员":
            metaConfigMap[key] = {}; // 路产大类下的每个小类分别是一种类型的数据
            metaConfig[key].forEach((item) => {
              metaConfigMap[key][item.name] = {};
              item.children &&
                item.children.forEach((child) => {
                  metaConfigMap[key][item.name][child.name] = [];
                });
            });
            break;
          case "机构":
            metaConfigMap[key] = {}; // 路产大类下的每个小类分别是一种类型的数据
            metaConfig[key].forEach((item) => {
              metaConfigMap[key][item.name] = {};
              item.children &&
                item.children.forEach((child) => {
                  metaConfigMap[key][item.name][child.name] = [];
                });
            });
            break;
          default:
            this.console(
              `metaConfigMap key is not defined handle case：${key}`
            );
            break;
        }
      });
      console.log(`GENERATE_AMAP_MAKERS_MANAGE：${metaConfigMap}`);
      emptyObj.amapMakersManage = metaConfigMap;
    },
    draw({ eventName, eventObj }) {
      let $AMap = this.$AMap;
      let map = this.map;
      switch (eventName) {
        case "leftSearchOnePoint":
          let point = eventObj.point;
          $AMap.convertFrom(
            [
              point.target.geometry.coordinates[1],
              point.target.geometry.coordinates[0],
            ],
            "gps",
            (status, result) => {
              if (result.info === "ok") {
                console.log(result);
                let marker = new $AMap.Marker({
                  position: result.locations[0],
                  // visible: false,
                  map: map,
                  // content: content,
                  // offset: new AMap.Pixel(-22, -34),
                });
                marker.setExtData(point.target);
                point.marker = marker;
                marker.on(
                  "click",
                  this.bind_Culvert_Bridge_Tunnel($AMap)["click"]
                );

                this.$WebMap.triggerEvent("setZoomAndCenter", {
                  center: result.locations[0],
                  zoom: 17,
                });
              } else {
              }
            }
          );

          break;

        default:
          break;
      }
    },
  },
};
