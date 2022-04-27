<template>
  <div style="margin: 0 auto; width: 300px">
    <div
      v-for="(item, index) in Object.keys(legend)"
      :data-item="{ [item]: legend[item] }"
    >
      <div v-if="`${legend[item] instanceof Array === true}`">
        <Legend :legendItem="legend[item]" :title="item" />
      </div>
      <!-- <div v-else v-for="(item2, index2) in Object.keys(legend[item2])">
      <Legend :legendItem="{ [item2]: legend[item][item2] }" />
    </div> -->
    </div>
  </div>
</template>

<script>
  // import
  import Legend from '~@/web-map/components/legend.vue'
  export default {
    name: 'LegendPage',
    components: {
      Legend
    },
    data() {
      return {
        legend: [
          [
            '桥梁',
            [
              { icon: 'iconfont 桥梁评定等级', name: '桥梁评定等级' },
              { icon: 'iconfont XXX', name: '桥梁分类（长度）' }
            ]
          ],
          [
            '路产',
            [
              [
                '服务设施1',
                [
                  { icon: 'iconfont XXX', name: '交通标志' },
                  { icon: 'iconfont XXX', name: '标线' },
                  { icon: 'iconfont XXX', name: '护栏' },
                  { icon: 'iconfont XXX', name: '防护设施' },
                  { icon: 'iconfont XXX', name: '照明设施' },
                  { icon: 'iconfont XXX', name: '排水设施' }
                ]
              ]
            ]
          ]
        ]
      }
    }
  }
</script>

<style lang="scss" scoped></style>
