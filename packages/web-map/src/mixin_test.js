import axios from "axios";
export default {
  methods: {
    test_loadLayer({ layerName = "map:LX_X", version = "1.1.1" }) {
      if (this.geoLayersManage[layerName]) return;
      let wms = new this.$AMap.TileLayer.WMS({
        url: "http://localhost:8080/geoserver/map/wms",
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
      console.log(this.geoLayersManage);
    },
    // 显示和隐藏的Layer 针对 国道线乡村 非线路 隐藏Layer 会隐藏道路的layer
    test_hideLayer({ wms, layerName }) {
      if (!wms || !layerName) return;
      if (!this.geoLayersManage[layerName]) {
        this.alert("图层尚未加载完成，请稍后操作");
        return;
      }
      if (wms) {
        wms.hide();
      } else if (layerName) {
        this.test_clearLayerChildren(layerName, "hide");
      }
    },
    test_showLayer({ wms, layerName }) {
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
    test_layerClicked({ lng, lat }) {
      // TODO: 直接查询第一个layer 后续再调整
      let activedLayerName =
        this.$refs.HeadPickGroup[0].getActivatedItemLayerName(); // 获取当前激活的layer
      if (!activedLayerName) {
        this.console("当前没有选中的图层");
        return;
      }

      const delta = 0.03467559814453125;
      axios({
        method: "get",
        url: "http://localhost:8080/geoserver/map/wms",
        params: {
          SERVICE: "WMS",
          VERSION: "1.1.1",
          REQUEST: "GetFeatureInfo",
          FORMAT: "image/png",
          TRANSPARENT: "true",
          QUERY_LAYERS: activedLayerName,
          STYLES: "",
          LAYERS: activedLayerName,
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
        this.console(res, "log");
        if (res.data.numberReturned > 0) {
          // 隐藏主图层 因为目前颜色未区分
          this.geoLayersManage[activedLayerName].hide();
          res.data.features.forEach((item) => {
            const label = "LXMC"; // TODO: 定义查询参数 后续再调整
            this.test_query({
              layerName: activedLayerName,
              query: `${label}='${item.properties[label]}'`,
            });
          });
        }
      });
    },
    // 通过点查线
    test_request() {},
    // 通过查询条件查询线路数据并渲染到图层上
    test_query({
      layerName = "map:LX_X",
      query = "LXMC='晓墅-南林场叉口'",
      version = "1.1.1",
    }) {
      let wms = new this.$AMap.TileLayer.WMS({
        url: "http://localhost:8080/geoserver/map/wms",
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
    },
    /**
     * @description 清除图层上的子图层
     * @param {String} layerName 路网图层名称
     * @param {String} roadNetStatus 路网图层状态 show | hide
     * @param {Boolean} distoryLayer 路网是否销毁
     */
    test_clearLayerChildren(layerName, roadNetStatus, distoryLayer = false) {
      this.geoLayersManage[layerName].$children.forEach((child) => {
        child.hide();
        child.setMap(null);
      });
      this.geoLayersManage[layerName].$children = [];

      if (roadNetStatus) {
        this.geoLayersManage[layerName][roadNetStatus]();
      }
      // 不一定用
      if (distoryLayer) {
        this.geoLayersManage[layerName].setMap(null);
        try {
          delete this.geoLayersManage[layerName];
        } catch (error) {
          this.geoLayersManage[layerName] = null;
        }
      }
    },
    test_loadLine() {
      this.test_query({});
    },
    // TODO: 解决回显时 数据修改页面不刷新为题
    test_setMetaConfig() {
      this.metaConfig.get("路网")[0].children[0].value =
        !this.metaConfig.get("路网")[0].children[0].value;
      this.$refs.HeadPickGroup[0].$forceUpdate();
    },
    test_getActived() {
    },
    // 擦除线路图层- 非路网图层
    test_rubOffLine(LayerName) {
      // TODO: 直接查询第一个layer 后续再调整
      let activedLayerName =
        LayerName || this.$refs.HeadPickGroup[0].getActivatedItemLayerName(); // 获取当前激活的layer
      if (!activedLayerName) {
        this.console("当前没有选中的图层");
        return;
      }
      this.test_clearLayerChildren(activedLayerName, "show");
    },
  },
};
