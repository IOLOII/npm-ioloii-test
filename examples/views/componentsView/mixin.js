import eventBus from "./eventBus";
export default {
  data: () => ({
    amapMakersManage: null,
    $AMap: null,
    map: null,
  }),
  created() {
    eventBus.$on("getMetaConfig", ({ emptyObj }) => {
      emptyObj.metaConfig = this.metaConfig;
    });
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
  },
  methods: {
    alert(v) {
      if (process.env.NODE_ENV === "development") {
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
      if (process.env.NODE_ENV === "development") {
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
        url: "https://yx.91jt.net/testroad/api/pc/pcHome/highwayProperty",
        headers: {
          token: this.tempToken,
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios(config)
        .then((response) => {
          let arr = [
            "tpCamera", // 监控设备
            "tpDrainage", // 排水设施
            "tpGuardrail", // 护栏
            "tpLabel", // 交通标志
            "tpLighting", // 照明设施
            "tpMarking", // 标线
            "tpParkingLot", // 停车区
            "tpPetrolStation", // 加油站
            "tpPlate", // 桥梁养护牌
            "tpSavefacilities", // 防护措施
            "tpSst", // 服务站
            "tpStation", // 管理站
            "tpSuper", // 治超站点
            "tpTollStation", // 收费站
          ];
          let obj = {}; // 挂载数据对象
          // let markerCluster = []; // 存放转换后 生成的每一个marker
          let toTransItem = []; // 存放有效点的经纬度数据
          let toTransItemObj = []; // 存放有效点的引用对象
          Object.keys(amapMakersManage["路产"]).forEach((key) => {
            Object.assign(obj, amapMakersManage["路产"][key]);
          });
          arr.forEach((item) => {
            try {
              if (response.data[item]) {
                response.data[item] = JSON.parse(
                  decodeURIComponent(response.data[item])
                );
                obj[item] = response.data[item].features;
                response.data[item].features.forEach((point, index) => {
                  // {"type":"Feature","geometry":{"type":"Point","coordinates":[1,1]},"properties":{"name":"12312"},"id":"fid--5165cb05_1804a317c59_-7bd1"}
                  // 高德转经纬度

                  if (
                    point.geometry &&
                    point.geometry.coordinates[1] &&
                    point.geometry.coordinates[0]
                  ) {
                    // this.console(
                    //   point.geometry.coordinates[1],
                    //   point.geometry.coordinates[0]
                    // );
                    toTransItem.push([
                      point.geometry.coordinates[1],
                      point.geometry.coordinates[0],
                    ]);
                    toTransItemObj.push(point);
                  }
                });
              } else {
                response.data[item] = {};
              }
            } catch (error) {
              this.console("get road property error");
            }
          });

          // 批量转换经纬度
          $AMap.convertFrom(toTransItem, "gps", (status, result) => {
            if (result.info === "ok") {
              result.locations.forEach((item, index) => {
                let point = toTransItemObj[index];
                let marker = new $AMap.Marker({
                  position: item,
                  visible: false,
                  map: map,
                  // icon: new $AMap.Icon({
                  //   size: new $AMap.Size(24, 24),
                  //   image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                  // }),
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
            }
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
          map.setCenter(target.lnglat);
          map.setZoom(17, false, 500);
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
            this.teleportStaticHTML = `<div>`;
            Object.keys(ExtData.properties).forEach((key) => {
              this.teleportStaticHTML += `
                <div>
                  <span style="color: #0048BA;margin-right: 10px;">
                    ${key}
                  </span>
                  <span> :   ${ExtData.properties[key]}</span>
                </div>
              `;
            });
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
        url: "https://yx.91jt.net/testroad/api/pc/pcHome/queryHomePoint",
        headers: {
          token:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NTA5NTU2MzYsInVzZXJuYW1lIjoiYWRtaW4ifQ.Tqw5LZAKeMKiXn5llaphc1YWPcY1z85hFI5Mx7G19t8",
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
          Promise.all(promiseArr)
            .then((res) => {
              let temparr = [];
              res.map((item) => (temparr = temparr.concat(item)));
              let locations = temparr;

              locations.forEach((item, index) => {
                let point = toTransItemObj[index];
                let marker = new $AMap.Marker({
                  position: item,
                  // visible: false,
                  map: map,
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
          console.log(ExtData);
          map.setCenter(target.lnglat);
          map.setZoom(17, false, 500);
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
            this.teleportStaticHTML = `<div>`;
            Object.keys(ExtData.properties).forEach((key) => {
              this.teleportStaticHTML += `
                <div>
                  <span style="color: #0048BA;margin-right: 10px;">
                    ${key}
                  </span>
                  <span> :   ${ExtData.properties[key]}</span>
                </div>
              `;
            });
            this.teleportStaticHTML += `</div>`;
          });
        },
      };
    },
  },
};
