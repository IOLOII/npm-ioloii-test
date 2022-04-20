<template>
  <div class="webmap-wrapper">
    <div style="position: absolute; top: -100px"></div>
    <div
      class="webmap-wrapper-layer webmap-wrapper-map-container"
      ref="webmap"
      @click.stop="g_click('webmap-layer')"
    ></div>
    <Supended v-if="true" ref="Supended">
      <template #top>
        <div
          style="display: flex; width: 80%; justify-content: space-around"
          @click.stop=""
        >
          <HeadPickGroup
            ref="HeadPickGroup"
            @eventHandle="topPickGroupEventHandle"
            :baseDataTitle="key"
            :baseDataArr="metaConfig.get(key)"
            v-for="key in metaConfig.keys()"
            :key="key"
          />
        </div>
      </template>
      <template #right>
        <!-- style="display: flex; width: 80%; justify-content: space-around" -->
        <div @click.stop="">
          <button @click="test_loadLayer">测试图层加载</button>
          <button @click="test_showLayer({ layerName: 'map:LX_Y' })">测试图层显示</button>
          <button @click="test_hideLayer">测试图层隐藏</button>
          <button @click="test_loadLine">测试道路查询加载</button>
          <button @click="test_setMetaConfig">顶部赋值操作</button>
          <button @click="test_getActived">获取选中项</button>
          <button @click="test_rubOffLine ">清除查询的线路数据</button>
        </div>
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
  // 事件
  import eventBus from './eventBus'
  // 图层
  import AMapLoader from '@amap/amap-jsapi-loader'
  import Supended from './1suspended/container.vue'
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
        required: true
      }
    },
    data() {
      return {
        map: null,
        $AMap: null,
        // geo图层管理对象
        geoLayersManage: {}
        // metaConfigCache:{}
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
      // metaConfig() {
      //   return metaConfig
      // }
    },
    created() {
      if (!this.$amapKey) {
        this.alert('尚未配置mapkey!')
      } else {
        this.initMap()
      }
      this.initEvent()
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
        if (typeof v === 'object') {
          alert(JSON.stringify(v))
        } else {
          alert(v)
        }
      },
      console(v, type = 'error') {
        if (process.env.NODE_ENV === 'development') {
          console[type](v)
        }
      },
      initEvent() {
        eventBus.$on('g_click', this.g_click)
        eventBus.$on('suspendedClick', this.suspendedClick)
      },
      initMapEvevt() {
        this.map.on('click', ev => {
          // 触发事件的对象
          let target = ev.target
          // 触发事件的地理坐标，AMap.LngLat 类型
          let lnglat = ev.lnglat
          // 触发事件的像素坐标，AMap.Pixel 类型
          let pixel = ev.pixel
          // 触发事件类型
          let type = ev.type
          // this.console({target,lnglat,pixel,type})
          this.test_layerClicked(ev.lnglat)
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
            let map = new AMap.Map(this.$refs.webmap, this.mapOptions)
            this.map = map
            this.initMapEvevt()
            if (this.metaConfig.get('路网')) {
              this.loadRoadNet(this.metaConfig.get('路网'))
            }
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
      // 顶部区域的事件回调
      /**
       * @description 主要处理由顶部区域点击后的事务
       * @param {String} type 事件类型 单个还是全部 item | all
       * @param {Object} eventObj 事件对象 是item还是item的父级（全选操作）
       * @param {Boolean} value 是否选中
       * @param {Object} componentObj 父级
       * @param {Object} item 子级 如果是父级出发,则会出现空的情况 headLineValueChange事件
       */
      topPickGroupEventHandle({ type, eventObj, value, componentObj, item = null }) {
        switch (componentObj.name) {
          case '路网':
            // 展现或隐藏 layer
            this.console(eventObj.layerName,'log')
            switch (type) {
              case 'item':
                let reverses = []
                let layerNames = Object.keys(this.geoLayersManage)
                // 找出layerNames中不包含eventObj.layerName的值
                layerNames.forEach(layerName => {
                  if (layerName !== eventObj.layerName) {
                    reverses.push(layerName)
                  }
                })
                if (value) {
                  this.geoLayersManage[eventObj.layerName].show()
                  reverses.forEach(ln=>{
                    this.test_clearLayerChildren(ln,'hide')
                  })
                } else {
                  // 隐藏的时候 当前线路关闭后 显示当前的 其他情况隐藏当前
                  // this.geoLayersManage[eventObj.layerName].hide();
                  this.test_clearLayerChildren(eventObj.layerName,'hide')
                }
                break
              // 路网暂不考虑显示多个layer,已互斥
              case 'all':
                break
            }

            break
          case '桥梁':
            break
          case '隧道':
            break
          case '涵洞':
            break
          case '路产':
            break
          default:
            this.console('缺乏枚举状态')
            break
        }
      },
      // TODO: 地图或外部事件发生后 诱发的顶部区域联动
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
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import './css/main.scss';
</style>
