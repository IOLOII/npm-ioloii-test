<template>
  <div class="webmap-wrapper">
    <div style="position: absolute; top: -100px"></div>
    <div
      class="webmap-wrapper-layer webmap-wrapper-map-container"
      ref="webmap"
      @click.stop="g_click('webmap-layer')"
    ></div>
    <Supended v-if="false" />

    <!-- <div
      class="webmap-wrapper-layer webmap-wrapper-anime-container"
      @click="g_click('anime-layer')"
    >
      动画层
    </div>
    <div
      class="webmap-wrapper-layer webmap-wrapper-modal-container"
      @click="g_click('modal-layer')"
    >
      模态框
    </div>
    <div
      class="webmap-wrapper-layer webmap-wrapper-toast-container"
      @click="g_click('toast-layer')"
    >
      系统提示
    </div> -->
  </div>
</template>

<script>
  /**
   * @author IOLOII
   * @github https://github.com/IOLOII
   * @create date 2022-04-14 16:39:18
   * @modify date 2022-04-14 16:39:18
   * @desc [WebMap]
   */
  // import
  import AMapLoader from '@amap/amap-jsapi-loader'

  import eventBus from './eventBus'

  import Supended from './1suspended/container.vue'
  export default {
    name: 'WebMap',
    components: {
      Supended
    },
    props: {
      version: {
        type: String,
        default: '2.0',
        // default: '1.4.15',
        require: false
      },
      plugins: {
        type: Array, // [string]
        required: false
      },
      options: {
        type: Object,
        required: false
      }
    },
    data() {
      return {
        map: null,
        $AMap: null
      }
    },
    computed: {
      mapOptions() {
        return Object.assign(
          {},
          {
            center: this.$amapCenter,
            // zoom:this.$amapZoom,
            // rotation:this.$amapRotation||0,
            rotateEnable: false,
            layers: [
              // 卫星
              new this.$AMap.TileLayer.Satellite(),
              // 路网
              new this.$AMap.TileLayer.RoadNet()
            ]
            // layers AMap.createDefaultLayer()
          },
          this.options
        )
      }
    },
    created() {
      if (!this.$amapKey) {
        this.alert('尚未配置mapkey!')
      } else {
        this.initMap()
      }
      this.initEvent()
    },
    mounted() {},
    methods: {
      alert(v) {
        if (typeof v === 'object') {
          alert(JSON.stringify(v))
        } else {
          alert(v)
        }
      },
      console(v, type = 'log') {
        console[type](v)
      },
      initEvent() {
        eventBus.$on('g_click', this.g_click)
        eventBus.$on('suspendedClick', this.suspendedClick)
      },
      initMap() {
        AMapLoader.load({
          key: this.$amapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
          version: this.version, // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
          plugins: this.plugins // 需要使用的的插件列表，如比例尺'AMap.Scale'等
        })
          .then(AMap => {
            if (!this.$refs.webmap) {
              this.alert('map ref is null')
              return
            }
            this.$AMap = AMap
            let map = new AMap.Map(this.$refs.webmap, this.mapOptions)
            this.map = map
            // var wms = new AMap.TileLayer.WMTS({
            //   url: 'http://127.0.0.1:8080/geoserver/topp/wms?service=WMS',
            //   blend: false,
            //   tileSize: 256
            //   // params: {
            //   //   Layer: 'topp:tasmania_roads',
            //   //   Version: '1.1.1',
            //   //   Format: 'image/png',
            //   //   TileMatrixSet: 'EPSG:4326'
            //   // }
            // })

            // wms.setMap(map)

            // var wms = new AMap.TileLayer.WMS({
            //   url: 'https://ahocevar.com/geoserver/wms',
            //   blend: false,
            //   tileSize: 512,
            //   params: {
            //     LAYERS: 'topp:states',
            //     VERSION: '1.3.0'
            //   }
            // })
            // var wms = new AMap.TileLayer.WMTS({
            //   url:
            //     'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer/WMTS/',
            //   blend: false,
            //   tileSize: 256,
            //   params: { Layer: '0', Version: '1.0.0', Format: 'image/png' }
            // })

            // 加载geoserver发布的本地数据
            var wms2 = new AMap.TileLayer.WMS({
              url: 'http://localhost:8080/geoserver/map/wms',
              blend: false,
              // tileSize: 512,
              params: {
                LAYERS: 'map:group',
                VERSION: '1.1.1'
                // CRS: 'EPSG:404000',
                // Format: 'image/png'
                //  exceptions: 'application/vnd.ogc.se_inimage'
              }
            })
            console.log(wms2)
            wms2.setMap(map)
            // setTimeout(() => {
            //   wms2.hide()
            // }, 10000)
          })
          .catch(e => {
            this.alert(e)
          })
      },
      g_click(t) {
        this.console(t)
      },
      // suspended
      suspendedClick(direction) {
        this.console(direction)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './css/main.scss';
</style>
