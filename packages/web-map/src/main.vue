<template>
  <div class="webmap-wrapper" :style="{ '--width': width, '--height': height }">
    <div style="position: absolute; top: -100px"></div>
    <div
      v-if="true"
      class="webmap-wrapper-layer webmap-wrapper-map-container"
      @click.stop="g_click('webmap-layer')"
      ref="webmap"
    ></div>
    <Supended v-if="true" ref="Supended">
      <!-- <template #top>
        <div
          style="display: flex; width: 80%; justify-content: flex-start; flex-wrap: wrap"
          @click.stop=""
        >
          <HeadPickGroup
            ref="HeadPickGroup"
            @pickHandle="pickGroupEventHandle"
            :baseDataTitle="key"
            :baseDataArr="metaConfig[key]"
            v-for="key in Object.keys(metaConfig)"
            :key="key"
          />
        </div>
      </template> -->
      <!-- <template #right>
        <div @click.stop="">
          <button @click="loadLayer">测试图层加载</button>
          <button @click="showLayer({ layerName: 'map:LX_Y' })">测试图层显示</button>
          <button @click="hideLayer">测试图层隐藏</button>
          <button @click="loadLine">测试道路查询加载</button>
          <button @click="setMetaConfig">顶部赋值操作</button>
          <button @click="getActived">获取选中项</button>
          <button @click="rubOffLine()">清除查询的线路数据</button>
          <button @click="getGdPoint">获取路网数据</button>
        </div>
      </template> -->

      <template #top v-if="$slots.supendedTop">
        <slot name="supendedTop"></slot>
      </template>

      <template #left v-if="$slots.supendedLeft">
        <slot name="supendedLeft"></slot>
      </template>

      <!-- <template #right v-if="$slots.supendedRight">
        <slot name="supendedRight"> </slot>
      </template> -->

      <template #bottom v-if="$slots.supendedBottom">
        <slot name="supendedBottom"></slot>
      </template>
    </Supended>

    <Anime v-if="true" ref="Anime">
      <template #left v-if="$slots.animeLeft">
        <slot name="animeLeft"> </slot>
      </template>
      <template #right v-if="$slots.animeRight">
        <slot name="animeRight"> </slot>
      </template>
    </Anime>
    <Modal ref="Modal" />

    <!-- <div
      class="webmap-wrapper-layer webmap-wrapper-toast-container"
      @click="g_click('toast-layer')"
    >
      系统提示
    </div> -->

    <!-- 自定义层 -->
    <!-- 图例 -->
    <Teleport to=".webmap-wrapper" v-if="hasLegend">
      <div
        class="point legend-plugin"
        style="
          top: 15px;
          right: calc(34px + 25px);
          text-align: center;
          position: absolute;
          transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
          box-shadow: 0 1px 5px rgb(0 0 0 / 40%);
          background: white;
          background-position: 50% 50%;
          background-repeat: no-repeat;
          display: block;
          border-radius: 3px;
          padding: 0;
        "
        :style="{
          padding: legendVisible ? '10px' : '0px'
        }"
        @mouseover="legendVisible = true"
        @mouseleave="legendVisible = false"
      >
        <a
          v-show="!legendVisible"
          class="amap-ui-control-layer-toggle"
          style="width: 34px; height: 34px; line-height: 34px; font-size: 22px"
        >
          <!-- <i class="iconfont icon-layer-switcher" style="font-size: 22px"></i> -->
          <Icon type="icon-q" style="font-size: 22px" class="icon-layer-switcher"></Icon>
        </a>
        <Legend v-show="legendVisible" :legend="legend" />
      </div>
    </Teleport>
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
  // 图标
  // 事件
  import eventBus from './eventBus'
  // 图层
  import AMapLoader from '@amap/amap-jsapi-loader'
  import Supended from './1suspended/container.vue'
  import Anime from './3anime/container.vue'
  import Modal from './4modal/container.vue'
  import Teleport from '../components/teleport.vue'
  import HeadPickGroup from '../components/headPickGroup.vue'

  import Legend from '../components/legend'
  import anime from 'animejs'
  import Icon from '../components/icon'

  // 配置
  // import { metaConfig } from './metaConfig'
  import mixin from './mixin.js'
  import devTest from './devTest.js'
  import legend from './legend.js'

  export default {
    name: 'WebMap',
    mixins: [mixin, devTest, legend],
    components: {
      Supended,
      Anime,
      Modal,
      Teleport,
      HeadPickGroup,
      Legend,
      Icon
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
      },
      metaConfig: {
        type: Object,
        required: false
      },
      geoServerUrl: {
        type: String,
        required: false,
        default: 'http://localhost:8080/geoserver/map/wms'
      },
      geoQueryProp: {
        type: String,
        required: false,
        default: 'LXMC'
      },
      tempToken: {
        type: String,
        required: false,
        default: ''
      },
      width: {
        type: String,
        default: '100%',
        require: false
      },
      height: {
        type: String,
        default: '100%',
        require: false
      },
      hasLegend: {
        type: Boolean,
        default: false,
        require: false
      }
    },
    data() {
      return {
        map: null,
        $AMap: null,
        // geo图层管理对象
        geoLayersManage: {},
        // 高德marker管理
        amapMakersManage: {}
      }
    },
    computed: {
      mapOptions() {
        return Object.assign(
          {},
          {
            center: this.$amapCenter,
            zoom: this.$amapZoom || 10.85,
            // rotation:this.$amapRotation||0,
            rotateEnable: false,
            layers: [
              // 卫星
              // new this.$AMap.TileLayer.Satellite(),
              // 路网
              // new this.$AMap.TileLayer.RoadNet()
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
        this.amapMakersManage = this.generateAmapMakersManage()
      }
    },
    mounted() {},
    methods: {
      alert(v) {
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          this.console(v)
          return
        }
        if (typeof v !== 'string') {
          this.console(JSON.stringify(v))
        } else {
          alert(v)
        }
      },
      console(v, type = 'error') {
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          console[type](v)
        }
      },

      initMap() {
        AMapLoader.load({
          key: this.$amapKey, // 申请好的Web端开发者Key，首次调用 load 时必填
          version: this.version, // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
          plugins: this.plugins, // 需要使用的的插件列表，如比例尺'AMap.Scale'等
          AMapUI: {
            version: '1.1',
            plugins: []
          }
        })
          .then(AMap => {
            let map = null
            if (!this.$refs.webmap) {
              this.alert('map ref is null')
              return
            }

            this.$AMap = AMap
            this.map = new AMap.Map(this.$refs.webmap, this.mapOptions)
            map = this.map

            // 先
            this.$emit('initializedHandle', {
              amapMakersManage: this.amapMakersManage,
              $AMap: AMap,
              map: this.map
            })
            // 后
            this.$emit('initMapEvevt')
            // 加载路网
            if (this.metaConfig['路网']) {
              this.loadRoadNet(this.metaConfig['路网'])
            }
            AMapUI.loadUI(['control/BasicControl'], function (BasicControl) {
              var layerCtrl = new BasicControl.LayerSwitcher({
                //control-cus 见全局style
                theme: 'control-cus',
                position: 'tr'
              })

              map.addControl(layerCtrl)
              setTimeout(() => {
                document
                  .querySelector('.amap-ui-control-layer')
                  .addEventListener('mouseover', () => {
                    anime({
                      targets: '.legend-plugin',
                      duration: 300,
                      easing: 'spring(1, 80, 10, 0)',
                      loop: false,
                      direction: 'normal',
                      translateX: '-78px'
                    })
                  })
                document
                  .querySelector('.amap-ui-control-layer')
                  .addEventListener('mouseleave', () => {
                    anime({
                      targets: '.legend-plugin',
                      duration: 300,
                      easing: 'spring(1, 80, 10, 0)',
                      loop: false,
                      direction: 'normal',
                      translateX: '0px'
                    })
                  })
              }, 200)

              //缩放控件
              map.addControl(
                new BasicControl.Zoom({
                  //内置的dark主题
                  theme: 'light',

                  //左下角
                  position: 'br'
                })
              )

              //动态加载css
              // AMapUI.loadCss('./zoom-green.css', function () {
              //   var zoomCtrl = new BasicControl.Zoom({
              //     //见zoom-green.css
              //     theme: 'my-green',
              //     position: 'br',
              //     showZoomNum: true
              //   })

              //   map.addControl(zoomCtrl)
              // })
            })
            if (this.hasLegend) {
              this.generateAmapLegend()
            }
          })
          .catch(e => {
            this.alert(e)
          })
      },
      loadRoadNet(arrs = [[]]) {
        // 遍历二维数组arrs的每项，继续遍历每项中的children,取出children中每子级中的layerName属性 并保存到数组中
        let layerNames = []
        arrs.forEach(item => {
          item.children.forEach(child => {
            layerNames.push(child.layerName)
          })
        })
        layerNames.forEach(layerName => {
          this.loadLayer({ layerName })
        })
      },
      // 根据metaConfig中的桥梁,隧道,涵洞,路产,遍历每一项的children,取出children中每子级中的name属性，生成映射关系的对象
      // TODO:// SOLVED:提出 放在组件外生成
      generateAmapMakersManage() {
        let emptyObj = {
          amapMakersManage: {}
        }
        this.$emit('handleEvent', {
          eventName: 'generateAmapMakersManage',
          eventObj: { emptyObj, metaConfig: this.metaConfig }
        })
        return emptyObj.amapMakersManage
        if (this.amapMakersManage && JSON.stringify(this.amapMakersManage) !== '{}') {
          this.console('amapMakersManage is not empty')
          return this.amapMakersManage
        }
        // 桥梁,隧道,涵洞,路产
        let metaConfigMap = {}
        metaConfigMap.overlays = {} // 预留 非metaConfig 配置中使用的地图功能
        Object.keys(this.metaConfig).forEach(key => {
          switch (key) {
            case '路网':
              break
            case '桥梁':
            case '隧道':
            case '涵洞':
              metaConfigMap[key] = []
              break
            case '路产':
              metaConfigMap[key] = {}
              this.metaConfig[key].forEach(item => {
                metaConfigMap[key][item.name] = {}
                item.children &&
                  item.children.forEach(child => {
                    if (child.prop) {
                      metaConfigMap[key][item.name][child.prop] = []
                    } else {
                      metaConfigMap[key][item.name][child.name] = []
                    }
                  })
              })
              break
          }
        })
        return metaConfigMap
      },
      // 触发事件
      triggerEvent(eventName, eventObj = {}) {
        // 这里拆开 为了看参数
        switch (eventName) {
          case 'openModal':
            let { type, html, callback } = eventObj
            eventBus.$emit(eventName, { type, html, callback })
            break
          case 'animeMove':
            let { direction, isShow, sideConf } = eventObj
            eventBus.$emit(eventName, { direction, isShow, sideConf })
            break
          case 'setCenter':
            let { center } = eventObj
            this.map.setCenter(center || this.mapOptions.center)
            break
          case 'setZoom':
            let { zoom, time = 500 } = eventObj
            this.map.setZoom(zoom || this.mapOptions.zoom, false, time)
            break
          case 'setZoomAndCenter':
            let { center: center2, zoom: zoom2, time: time2 = 500 } = eventObj
            this.map.setZoomAndCenter(
              zoom2 || this.mapOptions.zoom,
              center2 || this.mapOptions.center,
              false,
              time2
            )
            break
          default:
            // rubOffLine
            if (this[eventName]) {
              this[eventName](eventObj)
              this.console(`事件未捕获 但执行： TriggerEvent_${eventName}`)
            } else {
              this.console(`事件未捕获： TriggerEvent_${eventName}`)
            }
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './css/main.scss';
</style>
<style lang="scss">
  * {
    &::-webkit-scrollbar-track-piece {
      background: #d3dce6;
      border-radius: 20px;
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #99a9bf;
      border-radius: 20px;
    }
  }
  .amap-ui-control-position-br,
  .amap-ui-control-position-rb {
    bottom: 15px !important;
    right: 15px !important;
  }
  .amap-ui-control-theme-control-cus {
    top: 15px !important;
    right: 15px !important;
    a,
    span {
      cursor: pointer;
    }
    .amap-ui-control-layer {
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
      background: white;
    }

    .amap-ui-control-layer-expanded {
      color: #333;
      background: white;
    }

    .amap-ui-control-layer-toggle {
      color: #333;
    }
    .amap-ui-control-layer {
      transition: all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1);
    }
    .amap-ui-control-layer .iconfont {
      font-size: inherit;
      margin-right: unset;
    }
  }
</style>
