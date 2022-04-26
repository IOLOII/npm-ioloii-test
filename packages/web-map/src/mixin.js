import axios from "axios";
import eventBus from "./eventBus";
export default {
  methods: {
    loadLayer({ layerName = "map:LX_X", version = "1.1.1" }) {
      if (this.geoLayersManage[layerName]) return;
      let wms = new this.$AMap.TileLayer.WMS({
        url: this.geoServerUrl,
        blend: false,
        visible: false,
        params: {
          LAYERS: layerName,
          VERSION: version,
        },
      });
      wms.setMap(this.map);
      this.geoLayersManage[layerName] = wms;
      this.geoLayersManage[layerName].$children = [];
    },
    // 显示和隐藏的Layer 针对 国道线乡村 非线路 隐藏Layer 会隐藏道路的layer
    hideLayer({ wms, layerName }) {
      if (!wms || !layerName) return;
      if (!this.geoLayersManage[layerName]) {
        this.alert("图层尚未加载完成，请稍后操作");
        return;
      }
      if (wms) {
        wms.hide();
      } else if (layerName) {
        this.clearLayerChildren(layerName, "hide");
      }
    },
    showLayer({ wms, layerName }) {
      if (!wms || !layerName) return;
      if (!this.geoLayersManage[layerName]) {
        this.alert("图层尚未加载完成，请稍后操作");
        return;
      }
      if (wms) {
        wms.show();
      } else if (layerName) {
        this.geoLayersManage[layerName].show();
      }
    },

    // 测试点击图层上的一点，获取坐标 请求路线数据
    layerClicked({ lng, lat }) {
      // TODO: 直接查询第一个layer 后续再调整
      let emptyObj = {
        activedLayerName: "",
      };
      try {
        this.$emit("handleEvent", {
          eventName: "getActivatedLayerName",
          eventObj: { emptyObj, key: "路网" },
        }); // 获取当前激活的layer
      } catch (error) {
        this.console("getActivatedLayerName error");
      }
      let activedLayerName = emptyObj.activedLayerName;
      if (!activedLayerName) {
        this.console("当前没有选中的图层");
        return;
      }

      const delta = 0.03467559814453125;
      axios({
        method: "get",
        url: this.geoServerUrl,
        params: {
          SERVICE: "WMS",
          VERSION: "1.1.1",
          REQUEST: "GetFeatureInfo",
          FORMAT: "image/png",
          TRANSPARENT: "true",
          QUERY_LAYERS: activedLayerName.join(","),
          STYLES: "",
          LAYERS: activedLayerName.join(","),
          exceptions: "application/vnd.ogc.se_inimage",
          INFO_FORMAT: "application/json",
          FEATURE_COUNT: "50",
          X: "50",
          Y: "50",
          SRS: "EPSG:4326",
          WIDTH: "101",
          HEIGHT: "101",
          BBOX: `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`,
        },
      }).then((res) => {
        if (res.data.numberReturned > 0) {
          console.log(res);
          const label = this.geoQueryProp; // TODO: 定义查询参数 后续再调整
          this.map.setCenter([lng, lat]);

          // 隐藏主图层 因为目前颜色未区分

          // res.data.features.forEach((item) => {
          //   this.query({
          //     layerName: activedLayerName,
          //     query: `${label}='${item.properties[label]}'`,
          //     pointInfo: item,
          //   });
          // });
          // id: "nm_eeds_sd.81"
          // 只显示一条记录
          res.data.features[0].id.split(".")[0];
          activedLayerName.forEach((item) => {
            this.geoLayersManage[item].hide();
            if (item.includes(res.data.features[0].id.split(".")[0])) {
              activedLayerName = item;
            }
          });
          // set隐藏其他图层
          this.setOtherLayerValue(activedLayerName);
          this.query({
            layerName: activedLayerName,
            query: `${label}='${res.data.features[0].properties[label]}'`,
            pointInfo: res.data.features[0],
          });
        }
      });
    },
    // 通过查询条件查询线路数据并渲染到图层上
    query({
      layerName = "map:LX_X",
      query = "LXMC='晓墅-南林场叉口'",
      version = "1.1.1",
      pointInfo = {},
    }) {
      let wms = new this.$AMap.TileLayer.WMS({
        url: this.geoServerUrl,
        blend: false,
        // visible: true,
        params: {
          LAYERS: layerName,
          VERSION: version,
          CQL_FILTER: query,
        },
      });
      wms.setMap(this.map);
      this.geoLayersManage[layerName].$children.push(wms);
      // 查询到线路信息后 展开弹窗 传入当前wms信息 当关闭弹窗是
      // 触发弹窗事件
      // pointInfo: {
      //   geometry: { },
      //   geometry_name:''
      //   id: ''
      //   properties: { },
      //   type:[]
      // }
      // eventBus.$emit("openModal", {
      //   type: "default",
      //   html: `
      //     <div>
      //       <div>
      //         <span style="color: #b4b1b1;margin-right: 10px;">
      //           路线编号
      //         </span>
      //         <span>${pointInfo.properties.ROADCODE}</span>
      //       </div>
      //       <div >
      //         <span style="color: #b4b1b1;margin-right: 10px;">
      //           路线名称
      //         </span>
      //         <span>${pointInfo.properties.ROADNAME}</span>
      //       </div>
      //     </div>
      //   `,
      //   callback: {
      //     success: (res) => {
      //       // 关闭弹窗 回显默认layer
      //       this.rubOffLine();
      //       // 可传递事件
      //       this.map.setCenter(this.mapOptions.center);
      //       this.map.setZoom(this.mapOptions.zoom, false, 500);
      //     },
      //     fail: (err) => {
      //       console.log(err);
      //     },
      //   },
      // });
      // 抛出事件
      this.$emit("handleEvent", {
        eventName: "layerLineDetail",
        eventObj: {
          pointInfo
        },
      });

    },
    /**
     * @description 清除图层上的子图层 线路
     * @param {String} layerName 路网图层名称
     * @param {String} roadNetStatus 路网图层状态 show | hide
     * @param {Boolean} distoryLayer 路网是否销毁
     */
    clearLayerChildren(layerName, roadNetStatus, distoryLayer = false) {
      let _this = this;
      if (layerName instanceof Array) {
        layerName.forEach((layername) => {
          fun(layername);
        });
      } else {
        fun(layerName);
      }

      function fun(layername) {
        _this.geoLayersManage[layername].$children.forEach((child) => {
          child.hide();
          child.setMap(null);
        });
        _this.geoLayersManage[layername].$children = [];

        if (roadNetStatus) {
          _this.geoLayersManage[layername][roadNetStatus]();
        }
        // 不一定用
        if (distoryLayer) {
          _this.geoLayersManage[layername].setMap(null);
          try {
            delete _this.geoLayersManage[layername];
          } catch (error) {
            _this.geoLayersManage[layername] = null;
          }
        }
      }
    },
    /**
     * @description test
     */
    loadLine() {
      this.query({});
    },
    // 设置该图层隐藏 显示线路，隐藏其他图层
    setOtherLayerValue(layerName) {
      this.metaConfig["路网"][0].children.forEach((item) => {
        if (item.layerName !== layerName) {
          item.value = false;
          this.metaConfig["路网"][0].value = false;
        } else {
          this.clearLayerChildren(item.layerName, "hide");
        }
      });
      // this.metaConfig["路网"][0].children[0].value =
      //   !this.metaConfig["路网"][0].children[0].value;
      // this.$refs.HeadPickGroup[0].$forceUpdate();
    },
    getActived() {},
    // 擦除图层中的线路- 非路网图层，并显示该图层
    rubOffLine(LayerName = "") {
      // TODO: 直接查询第一个layer 后续再调整
      let emptyObj = {
        activedLayerName: "",
      };
      try {
        this.$emit("handleEvent", {
          eventName: "getActivatedLayerName",
          eventObj: { emptyObj, key: "路网" },
        });  // 获取当前激活的layer
      } catch (error) {
        this.console("getActivatedLayerName error");
      }
      let activedLayerName = emptyObj.activedLayerName;

      if (!activedLayerName) {
        this.console("当前没有选中的图层");
        return;
      }
      this.clearLayerChildren(activedLayerName, "show");
      // 设置地图中心
      // this.map.setCenter(this.$amapCenter);
    },

    //
    /**
     * @deprecated
     * @description 请求获取高德点位数据 路产数据
     * 已移出 放在组件外事件中触发
     */
    getGdPoint() {
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
            "tpLabel",
            "tpMarking",
            "tpGuardrail",
            "tpSavefacilities",
            "tpLighting",
            "tpDrainage",
            "tpTollStation",
            "tpSst",
            "tpPetrolStation",
            "tpParkingLot",
            "tpSuper",
            "tpStation",
            "tpPlate",
            "tpCamera",
          ];
          let obj = {}; // 挂载数据对象
          // let markerCluster = []; // 存放转换后 生成的每一个marker
          let toTransItem = []; // 存放有效点的经纬度数据
          let toTransItemObj = []; // 存放有效点的引用对象
          Object.keys(this.amapMakersManage["路产"]).forEach((key) => {
            Object.assign(obj, this.amapMakersManage["路产"][key]);
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
                response.data[item] = {};
              }
            } catch (error) {}
          });

          // 批量转换经纬度
          this.$AMap.convertFrom(toTransItem, "gps", (status, result) => {
            if (result.info === "ok") {
              result.locations.forEach((item, index) => {
                let point = toTransItemObj[index];
                let marker = new this.$AMap.Marker({
                  position: item,
                  visible: false,
                  // icon: new this.$AMap.Icon({
                  //   size: new this.$AMap.Size(24, 24),
                  //   image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                  // }),
                });
                marker.setMap(this.map); // 开启点聚合 则隐藏
                marker.setExtData(point);
                // markerCluster.push(marker);
                point.marker = marker;
                marker.lnglat = [item.lng, item.lat];
              });

              // TODO: 加载点聚合插件 如果点击全选 加载聚合，否则默认不聚合 仅加载点 可以通过maker控制 点聚合后无法控制
              // this.map.plugin(["AMap.MarkerCluster"], () => {
              //   let cluster = new this.$AMap.MarkerCluster(
              //     this.map,
              //     markerCluster,
              //     {
              //       gridSize: 80, // 聚合网格像素大小
              //     }
              //   );
              //   console.log(cluster)
              // });
            }
          });

          // k=服务设施2 服务设施1 管理设施
          Object.keys(this.amapMakersManage["路产"]).forEach((k) => {
            Object.keys(this.amapMakersManage["路产"][k]).forEach((key) => {
              this.amapMakersManage["路产"][k][key] = obj[key];
            });
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
