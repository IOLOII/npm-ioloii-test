<template>
  <div class="component-warpper">
    <WebMap
      :metaConfig="metaConfig"
      geoServerUrl="http://14.18.52.99:8000/geoserver/neimenggu/wms"
      geoQueryProp="ROADNAME"
      @loadMapData="loadMapData"
      ref="WebMap"
    />
  </div>
</template>

<script>
  // import
  import WebMap from '~@/web-map'
  import { metaConfig } from '~@/web-map/src/metaConfig'
  import mixin from './mixin.js'
  export default {
    name: 'componentsView',
    mixins: [mixin],
    components: {
      WebMap
    },
    computed: {
      metaConfig() {
        return metaConfig
      },
      tempToken() {
        return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NTA4NTM2MzQsInVzZXJuYW1lIjoiYWRtaW4ifQ.7K3GYKjvL0AGlbk6zLT917VyeZjF-5TJDrbqDqHtGq0'
      }
    },
    methods: {
      loadMapData({ amapMakersManage, $AMap, map }) {
        // 加载路产 点位
        this.getRoadProperty({
          amapMakersManage,
          $AMap,
          map,
          pointEvent: this.pointEvent()
        })
      },
      // 地图元素交互事件 返回一个匿名函数
      pointEvent() {
        return {
          type: ['click'], // default click
          click: $AMap => {
            return e => {
              let target = e.target
              let map = e.target.getMap()
              map.setCenter(target.lnglat)
              map.setZoom(17, false, 500)
              let infoWindow = new $AMap.InfoWindow({
                anchor: 'top-left',
                autoMove: true,
                content: target.getExtData().properties.name
              })
              infoWindow.open(map, target.lnglat)
              infoWindow.on('close', () => {
                map.setCenter(this.$refs.WebMap.mapOptions.center)
                map.setZoom(this.$refs.WebMap.mapOptions.zoom, false, 500)
              })

              // TODO: 插入其他元素或页面的交互事件
            }
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .component-warpper {
    width: 800px;
    height: 600px;
    background: #fff;
    border: 1px;
    box-sizing: border-box;
    box-shadow: 0 0 7px 2px #ccc;
    margin: 0 auto;
  }
</style>
