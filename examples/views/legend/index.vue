<template>
  <div style="display: flex; flex-wrap: wrap; margin: 0 auto; width: 300px">
    <Legend :legend="legend" />
  </div>
</template>

<script>
  // import
  import Legend from '~@/web-map/components/legend'
  export default {
    name: 'LegendPage',
    components: {
      Legend
    },
    data() {
      return {
        legend: [
          { name: '桥梁', icon: 'icon-lbs' },
          { name: '隧道', icon: 'icon-falling' },
          { name: '涵洞', icon: 'icon-shuangxiang' },
          { name: '交通标志', icon: 'icon-falling' },
          { name: '标线', icon: 'icon-falling' },
          { name: '护栏', icon: 'icon-falling' },
          { name: '防护设施', icon: 'icon-falling' },
          { name: '照明设施', icon: 'icon-falling' },
          { name: '排水设施', icon: 'icon-falling' },
          { name: '收费站', icon: 'icon-falling' },
          { name: '服务站', icon: 'icon-falling' },
          { name: '加油站', icon: 'icon-falling' },
          { name: '停车区', icon: 'icon-falling' },
          { name: '治超站点', icon: 'icon-falling' },
          { name: '公路管理站', icon: 'icon-falling' },
          { name: '桥梁养护牌', icon: 'icon-falling' },
          { name: '监控设备', icon: 'icon-falling' }
        ]
      }
    }
  }
</script>

<style lang="scss" scoped></style>
