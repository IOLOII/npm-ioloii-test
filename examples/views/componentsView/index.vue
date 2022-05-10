<template>
  <div class="component-warpper">
    <WebMap
      :metaConfig="metaConfig"
      geoServerUrl="http://14.18.52.99:8000/geoserver/neimenggu/wms"
      geoQueryProp="ROADNAME"
      @initializedHandle="initializedHandle"
      @initMapEvevt="initMapEvevt"
      @handleEvent="handleEvent"
      ref="WebMap"
      v-loading="loading"
      element-loading-text="加载中"
    >
      <!-- 支持top left bottom -->
      <template #supendedLeft>
        <SupebdLeft ref="SupebdLeft" />
      </template>

      <!-- 动画层 -->
      <!-- <template #animeLeft> 12321</template>
       -->
      <!-- 支持left right -->
      <template #animeRight>
        <span style="display: none"></span>
      </template>
    </WebMap>

    <Teleport to=".webmap-wrapper-anime-container .block.right">
      <div class="teleport">
        <div v-html="teleportStaticHTML" v-if="teleportStaticHTML"></div>
        <div v-else="teleportStaticHTML">
          <div style="text-align: center">当前暂无内容</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
  // import
  import WebMap from '~@/web-map'
  import Teleport from '~@/teleport'

  // import  '~@/web-map/components/公路标点图标.js'
  import './公路标点图标.css'

  import eventBus from './eventBus'
  import mixin from './mixin.js'
  import SupebdLeft from './component/supendedLeft.vue'
  import { metaConfig } from './metaConfig'

  export default {
    name: 'componentsView',
    mixins: [mixin],
    components: {
      WebMap,
      Teleport,
      SupebdLeft
    },
    provide() {
      return {
        tempToken: this.tempToken,
        tempService: this.tempService
      }
    },
    data: () => ({
      teleportStaticHTML: '',
      loading: false
    }),
    computed: {
      metaConfig() {
        return metaConfig
      },
      tempToken() {
        if (process.env.NODE_ENV === 'test') {
          return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NTIyMzg3NTksInVzZXJuYW1lIjoiYWRtaW4ifQ.eELd7A8oKNiywHSLrIgqu9cXRUDXukEp3ioBNtUMfnU'
        } else {
          return this.$cookie.get('token')
        }
      },
      tempService() {
        if (process.env.NODE_ENV === 'test') {
          // return 'https://yx.91jt.net/testroad'
          return '/testroad'
        } else {
          return ''
        }
      }
    },
    methods: {
      initializedHandle({ amapMakersManage, $AMap, map }) {
        this.$WebMap = this.$refs.WebMap
        this.amapMakersManage = amapMakersManage
        this.$AMap = $AMap
        this.map = map
        this.loadMapData({ amapMakersManage, $AMap, map })
      },
      /**
       * @description 初始化地图数据
       * @param {Object} param
       * @param {Object} param.amapMakersManage 地图标记管理器 根据metaConfig 生成，其中overlays用于存放不同业务模块中的标记，业务模块中单独管理
       * @param {Object} param.$AMap 地图构造函数
       * @param {Object} param.map 地图实例
       */
      loadMapData({ amapMakersManage, $AMap, map }) {
        // 智慧养护-事件类型
        this.get_MAINTENANCE_INCIDENT({
          amapMakersManage,
          $AMap,
          map,
          pointEvent: this.bind_MAINTENANCE_INCIDENT($AMap)
        })
        // 智慧养护-相关人员
        this.get_MAINTENANCE_PERSON({
          amapMakersManage,
          $AMap,
          map,
          pointEvent: this.bind_MAINTENANCE_PERSON($AMap)
        })
        // 智慧养护-机构
        this.get_MAINTENANCE_ORGANIZATION({
          amapMakersManage,
          $AMap,
          map,
          pointEvent: this.bind_MAINTENANCE_ORGANIZATION($AMap)
        })
      },
      /**
       * @description 点击复选框事件回调
       * @param {Object} param
       * @param {String} param.type 事件类型 单个还是全部 item | all
       * @param {Object} param.eventObj 事件对象 是item还是item的父级（全选操作）
       * @param {Boolean} param.value 是否选中
       * @param {Object} param.componentObj 父级
       * @param {Object} param.item 子级 如果是父级出发,则会出现空的情况 headLineValueChange事件
       */
      pickGroupEventHandle({
        type,
        eventObj,
        value,
        componentObj = {},
        item = {},
        _this,
        key
      }) {
        // key 大类 路网 桥梁 隧道 涵洞 路产
        if (!_this) _this = this.$WebMap
        if (!_this) {
          console.error('WebMap is empty, maybe dom timeout, please refresh web')
          alert('WebMap is empty, maybe dom timeout, please refresh web')
          return
        }
        let params = {}
        let sendReq = false
        switch (key) {
          // NOTE: 使用metaConfig的是需要先读取metaConfig的item value数据 进行请求，如果直接使用amapMakersManage对象的，是因为数据已经首次加载完毕，所以不需要再次请求
          case '类型事件':
            switch (type) {
              case 'item':
                _this.amapMakersManage[key][componentObj.name][item.name].forEach(
                  point => {
                    point.marker && point.marker[value ? 'show' : 'hide']()
                  }
                )
                break
              case 'all':
                Object.keys(_this.amapMakersManage[key][componentObj.name]).forEach(
                  prop => {
                    _this.amapMakersManage[key][componentObj.name][prop].forEach(
                      point => {
                        point.marker && point.marker[value ? 'show' : 'hide']()
                      }
                    )
                  }
                )
                break
            }
            break
          case '人员':
            switch (type) {
              case 'item':
                _this.amapMakersManage[key][componentObj.name][item.name].forEach(
                  point => {
                    point.marker && point.marker[value ? 'show' : 'hide']()
                  }
                )
                break
              case 'all':
                Object.keys(_this.amapMakersManage[key][componentObj.name]).forEach(
                  prop => {
                    _this.amapMakersManage[key][componentObj.name][prop].forEach(
                      point => {
                        point.marker && point.marker[value ? 'show' : 'hide']()
                      }
                    )
                  }
                )
                break
            }
            break
          case '机构':
            switch (type) {
              case 'item':
                _this.amapMakersManage[key][componentObj.name][item.name].forEach(
                  point => {
                    point.marker && point.marker[value ? 'show' : 'hide']()
                  }
                )
                break
              case 'all':
                Object.keys(_this.amapMakersManage[key][componentObj.name]).forEach(
                  prop => {
                    _this.amapMakersManage[key][componentObj.name][prop].forEach(
                      point => {
                        point.marker && point.marker[value ? 'show' : 'hide']()
                      }
                    )
                  }
                )
                break
            }
            break
          default:
            _this.console(`缺乏枚举状态: ${key}`)
            _this.console(componentObj.name)
            break
        }
      },
      /**
       * @description 注册地图事件
       */
      initMapEvevt() {
        // 注册路网事件
        this.map.on('click', ({ target, lnglat, pixel, type }) => {
          this.$WebMap.layerClicked(lnglat)
          // .. 其他
        })
        // ... 其他事件
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
          this.map.on('mousewheel', ({ target, lnglat, pixel, type }) => {
            console.log(this.map.getZoom())
          })
          this.map.on('mousemove', ({ target, lnglat, pixel, type }) => {
            const { lat, lng } = lnglat
          })
        }
      },

      /**
       * @description 组件事件回调，接收来自组件内的事件,triggerEvent 用于触发组件内的事件
       */
      handleEvent({ eventName, eventObj = {} }) {
        switch (eventName) {
          case 'getActivatedLayerName': // 响应 返回当前激活的图层名称
            let { emptyObj, key } = eventObj
            eventBus.$emit(eventName, { emptyObj, key })
            break
          case 'generateAmapMakersManage':
            this.generateAmapMakersManage(eventObj)
            break
          case 'layerLineDetail': // 路线点击线路后事件
            let { pointInfo } = eventObj
            console.log(pointInfo)

            this.loading = true
            const axios = require('axios')
            let config = {
              method: 'get',
              url: `${this.tempService}/tp/tpRoad/queryByRoadNo?roadNo=${pointInfo.properties.ROADCODE}`,
              headers: {
                token: this.tempToken
              }
            }

            axios(config)
              .then(response => {
                // console.log(JSON.stringify(response.data));
                let data = response.data
                console.log(response.data)
                this.$WebMap.triggerEvent('animeMove', {
                  direction: 'right',
                  isShow: true
                })

                this.$nextTick(() => {
                  this.teleportStaticHTML = `
                <div class="lineInfo">
                  <img
                    src="${
                      data.img ||
                      'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fwww.xmsouhu.com%2Fd%2Ffile%2Ftupian%2Fbizhi%2F2020-06-01%2F941ca540f4833b39f34ca7af18860200.jpg&refer=http%3A%2F%2Fwww.xmsouhu.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1653122631&t=44faeba24c47aa661db1a6d71bfd80da'
                    }"
                  />
                  <div class="group">
                    <span class="title">基础信息</span>
                    <div>
                      <span class="key">路线名称</span>
                      <span class="value"> ${data.name || '暂无'}</span>
                    </div>
                    <div>
                      <span class="key">路线编号</span>
                      <span class="value"> ${data.no || '暂无'}</span>
                    </div>
                    <div>
                      <span class="key">行政等级</span>
                      <span class="value">${
                        {
                          G: '国道',
                          S: '省道',
                          X: '县道',
                          Y: '乡道',
                          C: '存道',
                          Z: '专用公路'
                        }[data.administrativeGrade] || '暂无'
                      }</span>
                    </div>
                    <div>
                      <span class="key">起点桩号</span>
                      <span class="value">${data.startStake || '暂无'}</span>
                    </div>
                    <div>
                      <span class="key">终点桩号</span>
                      <span class="value">${data.endStake || '暂无'}</span>
                    </div>
                    <div>
                      <span class="key">所属行政区域</span>
                      <span class="value">${data.area || '暂无'}</span>
                    </div>
                    <div>
                      <span class="key">技术等级</span>
                      <span class="value">暂无</span>
                    </div>
                  </div>
                  <div class="group">
                    <span class="title">相关人员</span>
                    <div>
                      <span class="key">路长</span>
                      <span class="value">暂无</span>
                    </div>
                    <div>
                      <span class="key">巡查人员</span>
                      <span class="value">暂无</span>
                    </div>
                    <div>
                      <span class="key">养护人员</span>
                      <span class="value">暂无</span>
                    </div>
                    <div>
                      <span class="key">养护单位</span>
                      <span class="value">暂无</span>
                    </div>
                  </div>
                </div>
              `
                })
              })
              .catch(error => {
                console.log(error)
              })
              .finally(() => {
                this.loading = false
              })

            return
            // this.$WebMap.triggerEvent('openModal', {
            //   type: 'default',
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
            //     success: res => {
            //       // 关闭弹窗 回显默认layer
            //       this.$WebMap.triggerEvent('rubOffLine')
            //       // 可传递事件
            //       this.$WebMap.triggerEvent('setCenter')
            //       this.$WebMap.triggerEvent('setZoom')
            //     },
            //     fail: err => {
            //       this.console(err)
            //     }
            //   }
            // })

            break
          case 'loading':
            let { loading } = eventObj
            this.loading = loading
            break
          default:
            this.console(`事件未捕获： HandleEvent_${eventName}`)
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  // @import './cover.scss';
  .component-warpper {
    width: 90%;
    height: 80vh;
    background: #fff;
    border: 1px;
    box-sizing: border-box;
    // box-shadow: 0 0 7px 2px #ccc;
    margin: 0 auto;
  }
</style>
<style lang="scss">
  @import './themPatch.scss';

  // ### for teleport
  .teleport {
    text-align: left;
    // 路线信息
    .lineInfo {
      img {
        border-top-left-radius: 20px;
      }
      .group {
        padding-bottom: 10px;
        background: #ffffff3d;
        border-radius: 10px;
        margin: 5px 0;
        backdrop-filter: blur(1px);
        padding: 5px;
        text-align: left;
        > div:nth-child(2) {
          margin-top: 5px;
        }
        .title {
          margin-right: 10px;
          border-left: 5px $primary-color solid;
          padding-left: 10px;
          border-radius: 4px;
          color: white;
          font-weight: 800;
        }
        .key {
          color: #b4b1b1;
          margin-right: 10px;
          &::after {
            content: '：';
          }
        }
        .value {
          color: white;
          margin-right: 10px;
        }
      }
    }
  }
</style>
