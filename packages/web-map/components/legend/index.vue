<template>
  <div style="width: 19em">
    <div
      style="
        display: flex;
        flex-wrap: wrap;
        margin: 0 auto;
      "
      class="legend-wrapper"
    >
      <LegendItem :name="name" :icon="icon" v-for="({ name, icon }, index) in legend" />

    </div>
  </div>
</template>

<script>
  // import
  import LegendItem from './legendItem'
  export default {
    name: 'Legend',
    components: {
      LegendItem
    },
    props: {
      legend: {
        type: Array,
        default: () => [
          // { name: '桥梁', icon: 'icon-q' },
          // { name: '隧道', icon: 'icon-q' },
          // { name: '涵洞', icon: 'icon-shuangxiang' },
          // { name: '交通标志', icon: 'icon-q' },
          // { name: '标线', icon: 'icon-q' },
          // { name: '护栏', icon: 'icon-q' },
          // { name: '防护设施', icon: 'icon-q' },
          // { name: '照明设施', icon: 'icon-q' },
          // { name: '排水设施', icon: 'icon-q' },
          // { name: '收费站', icon: 'icon-q' },
          // { name: '服务站', icon: 'icon-q' },
          // { name: '加油站', icon: 'icon-q' },
          // { name: '停车区', icon: 'icon-q' },
          // { name: '治超站点', icon: 'icon-q' },
          // { name: '公路管理站', icon: 'icon-q' },
          // { name: '桥梁养护牌', icon: 'icon-q' },
          // { name: '监控设备', icon: 'icon-q' }
        ]
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
