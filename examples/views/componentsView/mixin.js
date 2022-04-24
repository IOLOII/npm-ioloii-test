export default {
  methods: {
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
          console.log(toTransItemObj);

          // 批量转换经纬度
          console.log(map);
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
              //   console.log(cluster)
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
          console.log(error);
        });
    },
  },
};
