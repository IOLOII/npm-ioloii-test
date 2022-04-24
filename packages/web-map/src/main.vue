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
      <template #top>
        <div
          style="display: flex; width: 80%; justify-content: flex-start; flex-wrap: wrap"
          @click.stop=""
        >
          <HeadPickGroup
            ref="HeadPickGroup"
            @pickHandle="pickGroupEventHandle"
            :baseDataTitle="key"
            :baseDataArr="metaConfig.get(key)"
            v-for="key in metaConfig.keys()"
            :key="key"
          />
        </div>
      </template>
      <!-- <template #right>
        <div @click.stop="">
          <button @click="test_loadLayer">测试图层加载</button>
          <button @click="test_showLayer({ layerName: 'map:LX_Y' })">测试图层显示</button>
          <button @click="test_hideLayer">测试图层隐藏</button>
          <button @click="test_loadLine">测试道路查询加载</button>
          <button @click="test_setMetaConfig">顶部赋值操作</button>
          <button @click="test_getActived">获取选中项</button>
          <button @click="test_rubOffLine()">清除查询的线路数据</button>
          <button @click="test_getGdPoint">获取路网数据</button>
        </div>
      </template> -->


      <!-- <template #top v-if="$slots.supendedTop">
        <slot name="supendedTop"> </slot>
      </template> -->

      <template #left v-if="$slots.supendedLeft">
        <slot name="supendedLeft"> </slot>
      </template>

      <!-- <template #right v-if="$slots.supendedRight">
        <slot name="supendedRight"> </slot>
      </template> -->

      <template #bottom v-if="$slots.supendedBottom">
        <slot name="supendedBottom"> </slot>
      </template>
    </Supended>
    <!-- <Teleport to=".webmap-wrapper">
      <span>123123</span>
      <span>123123</span>
    </Teleport> -->
    <!-- 弹出层测试 -->
    <!-- <Teleport to=".webmap-wrapper">
      <div style="" class="modal">
        <span>asdasdad</span>
      </div>
    </Teleport> -->
    <Anime v-if="true" ref="Anime">
      <template #left v-if="$slots.animeLeft">
        <slot name="animeLeft"> </slot>
      </template>
      <template #right v-if="$slots.animeRight">
        <slot name="animeRight"> </slot>
      </template>
    </Anime>
    <Modal ref="Modal" v-if="false" />

    <!-- <div
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
  // 图标
  import './font_3347926_3guahro8h8q.js'
  // 事件
  import eventBus from './eventBus'
  // 图层
  import AMapLoader from '@amap/amap-jsapi-loader'
  import Supended from './1suspended/container.vue'
  import Anime from './3anime/container.vue'
  import Modal from './4modal/container.vue'
  import Teleport from '../components/teleport.vue'
  import HeadPickGroup from '../components/headPickGroup.vue'

  // 配置
  // import { metaConfig } from './metaConfig'
  import mixin_test from './mixin_test.js'

  export default {
    name: 'WebMap',
    mixins: [mixin_test],
    components: {
      Supended,
      Anime,
      Modal,
      Teleport,
      HeadPickGroup
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
        type: Map,
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
        default:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NTA2ODYwNjUsInVzZXJuYW1lIjoiYWRtaW4ifQ.6ZR5BxnPmOlL376LwkTiwEVZLI5GT88ODqLENPSP9UA'
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
      }
    },
    data() {
      return {
        map: null,
        $AMap: null,
        // geo图层管理对象
        geoLayersManage: {},
        // metaConfigCache:{}
        amapMakersManage: {
          // 桥梁: {
          //   桥梁评定等级: {
          //     一类: [],
          //     二类: [],
          //     三类: [],
          //     四类: [],
          //     五类: []
          //   },
          //   '桥梁分类（长度）': {
          //     特大桥: [],
          //     大桥: [],
          //     中桥: [],
          //     小桥: []
          //   }
          // },
          // 隧道: {
          //   隧道评定等级: {
          //     一类: [],
          //     二类: [],
          //     三类: [],
          //     四类: [],
          //     五类: []
          //   },
          //   '隧道分类（长度）': {
          //     特大隧道: [],
          //     大隧道: [],
          //     中隧道: [],
          //     小隧道: []
          //   }
          // },
          // 涵洞: {
          //   涵洞位置: {
          //     主线涵洞: [],
          //     匝道涵洞: []
          //   },
          //   行政等级: {
          //     县道: [],
          //     乡道: [],
          //     村道: [],
          //     专用公路: []
          //   }
          // },
          // 路产: {
          //   服务设施1: {
          //     交通标志: [],
          //     标线: [],
          //     护栏: [],
          //     防护设施: [],
          //     照明设施: [],
          //     排水设施: []
          //   },
          //   服务设施2: {
          //     收费站: [],
          //     服务站: [],
          //     加油站: [],
          //     停车区: []
          //   },
          //   管理设施: {
          //     治超站点: [],
          //     公路管理站: [],
          //     桥梁养护牌: [],
          //     监控设备: []
          //   }
          // }
        }
      }
    },
    computed: {
      mapOptions() {
        return Object.assign(
          {},
          {
            center: this.$amapCenter,
            zoom: this.$amapZoom || 9.5,
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
      // metaConfig() {
      //   return metaConfig
      // }
    },
    created() {
      if (!this.$amapKey) {
        this.alert('尚未配置mapkey!')
      } else {
        this.initMap()
        this.amapMakersManage = this.generateAmapMakersManage()
      }
      this.initGlobalEvent()
    },
    mounted() {
      // console.log(this.metaConfig.get('路网'))
    },
    methods: {
      alert(v) {
        if (process.env.NODE_ENV === 'development') {
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
        if (process.env.NODE_ENV === 'development') {
          console[type](v)
        }
      },
      initGlobalEvent() {
        eventBus.$on('g_click', this.g_click)
        eventBus.$on('suspendedClick', this.suspendedClick)
      },
      initMapEvevt() {
        this.map.on('click', ({ target, lnglat, pixel, type }) => {
          this.test_layerClicked(lnglat)
        })
        this.map.on('mousewheel', ({ target, lnglat, pixel, type }) => {
          console.log(this.map.getZoom())
        })
        this.map.on('mousemove', ({ target, lnglat, pixel, type }) => {
          const { lat, lng } = lnglat
          // console.log(lat, lng)
        })
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
            this.map = new AMap.Map(this.$refs.webmap, this.mapOptions)
            this.initMapEvevt()
            // 加载路网
            if (this.metaConfig.get('路网')) {
              this.loadRoadNet(this.metaConfig.get('路网'))
            }
            // 加载路产
            // this.test_getGdPoint()
            this.$emit('loadMapData', {
              amapMakersManage: this.amapMakersManage,
              $AMap: AMap,
              map: this.map
            })
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
      },
      pickGroupEventHandle({ type, eventObj, value, componentObj, item = null }) {
        let _this = this
        this.$emit('pickHandle', {
          type,
          eventObj,
          value,
          componentObj,
          item,
          _this
        })
      },
      // TODO: 地图或外部事件发生后 诱发的顶部区域联动 见 test_setMetaConfig
      topPickGroupValueSet() {},
      // metaConfigCacheFun(key){
      //   if(this.metaConfigCache[key]) {
      //     return this.metaConfigCache[key]
      //   }else{
      //     this.metaConfigCache[key] = this.metaConfig.get(key)
      //     return this.metaConfigCache[key]
      //   }
      // }
      loadRoadNet(arrs = [[]]) {
        // 遍历二维数组arrs的每项，继续遍历每项中的children,取出children中每子级中的layerName属性 并保存到数组中
        let layerNames = []
        arrs.forEach(item => {
          item.children.forEach(child => {
            layerNames.push(child.layerName)
          })
        })
        layerNames.forEach(layerName => {
          this.test_loadLayer({ layerName })
        })
      },
      // 高德markers相关

      // 根据metaConfig中的桥梁,隧道,涵洞,路产,遍历每一项的children,取出children中每子级中的name属性，生成映射关系的对象
      generateAmapMakersManage() {
        // 桥梁,隧道,涵洞,路产
        let metaConfigMap = {}
        Array.from(this.metaConfig.keys()).forEach(key => {
          if (key === '路网') {
            return
          } else {
            metaConfigMap[key] = {}
            this.metaConfig.get(key).forEach(item => {
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
          }
        })
        // console.log(metaConfigMap)
        return metaConfigMap
      },
      // 触发事件
      triggerEvent(eventName, eventObj) {
        eventBus.$emit(eventName, eventObj)
        // 支持的事件有：
        // openModal, {type = 'default',html = '',callback = {uccess,fail  },
        // animeMove,{direction,isShow}
      }
    }
  }
</script>

<style lang="scss" scoped >
  @import './css/main.scss';
</style>
