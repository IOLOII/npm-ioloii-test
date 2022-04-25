<template>
  <div
    class="webmap-wrapper-layer webmap-wrapper-anime-container"
    @click="g_click('anime-layer')"
    style="overflow: hidden"
    :style="{
      visibility: animesCtrl.left || animesCtrl.right ? 'visible' : 'hidden'
    }"
  >
    <!-- <div
      style="position: absolute; visibility: visible; pointer-events: auto"
      v-show="true"
    >
      <button @click.stop="sidebarCtrlClick('all', false)" class="point">all 隐藏</button>
      <button @click.stop="sidebarCtrlClick('all', true)" class="point">all 显示</button>
      <button @click.stop="sidebarCtrlClick('alls', false)" class="point">
        alls 隐藏
      </button>
      <button @click.stop="sidebarCtrlClick('alls', true)" class="point">
        alls 显示
      </button>
    </div> -->

    <section
      @click.stop="sidebar('left')"
      class="block left"
      ref="left"
      v-if="$slots.left"
      :style="{
        '--width_l': sideConf.left,
      }"
    >
      <div class="block-wrapper">
        <slot name="left"></slot>
      </div>
    </section>
    <div v-else></div>

    <section
      @click.stop="sidebar('right')"
      class="block right"
      ref="right"
      v-if="$slots.right"
      :style="{
        '--width_r': sideConf.right,
      }"
    >
      <div class="block-wrapper">
        <slot name="right"></slot>
      </div>
    </section>
    <div v-else></div>
    <section
      class="block-btn left point"
      @click.stop="sidebarCtrlClick('left', !animesCtrl.left)"
      v-if="$slots.left"
    ></section>
    <section
      class="block-btn right point"
      @click.stop="sidebarCtrlClick('right', !animesCtrl.right)"
      v-if="$slots.right"
    ></section>
  </div>
</template>

<script>
  // import
  import anime from 'animejs'
  import eventBus from '../eventBus'
  export default {
    name: 'Anime',
    data: () => ({
      animesCtrl: {
        left: false,
        right: false
      },
      sideConf:{
        left: '300px',
        right: '300px'
        // leftHeight
        // rightHeight
        // margin:''
      }
    }),
    mounted() {
      // direction: 'left' 'right' ,'top' ,'bottom','all'-水平两个,'alls'-四个 isShow:boolean
      eventBus.$on('animeMove', ({ direction, isShow,sideConf = null }) => {
        sideConf = {
            right: '250px'
        }
        if(sideConf){
          Object.assign(this.sideConf,sideConf)
        }
        setTimeout(
          () => {
            switch (direction) {
              case 'left':
              case 'right':
                this.animesCtrl[direction] = isShow
                break
              case 'all':
              default:
                this.animesCtrl.left = isShow
                this.animesCtrl.right = isShow
                break
            }
          },
          isShow ? 0 : 300
        )
        this.showSidebar(direction, isShow)
      })
    },
    methods: {
      g_click(v) {
        eventBus.$emit('g_click', v)
      },
      sidebar(direction) {
        console.log(direction)
      },
      // 两侧控制
      sidebarCtrlClick(direction, isShow) {
        if (direction == 'alls') {
          direction = 'all'
          eventBus.$emit('app-header', {
            direction,
            isShow
          })
        }
        eventBus.$emit('animeMove', {
          direction,
          isShow
        })
      },
      showSidebar(direction, isShow) {
        let target = ''
        switch (direction) {
          case 'left':
          case 'right':
            target = this.$refs[direction]
            break
          case 'all':
          default:
            target = [this.$refs.left, this.$refs.right]
            break
        }
        anime({
          targets: target,
          translateX: function (el, i) {
            if (isShow) {
              return 0
            } else {
              if (direction === 'left') {
                return '-100%'
              }
              if (direction === 'right') {
                return '100%'
              }
              if (i === 0) {
                return '-100%'
              } else {
                return '100%'
              }
            }
          },
          duration: 300,
          easing: 'spring(1, 80, 10, 0)',
          loop: false,
          direction: 'normal',
          opacity: function (el, i) {
            if (isShow) {
              return 1
            } else {
              return 0
            }
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped >
  @import '../css/main.scss';
  .animeMove-side {
    &.left {
      // background-image: url('~@/assets/sidebars-left.png');
      .animeMove-side {
        &-item {
          &.first {
            // background-image: url('~@/assets/sidebars-left-first.png');
            &:hover {
              // background-image: url('~@/assets/sidebars-left-first_hover.png');
            }
          }
          &.second {
            // background-image: url('~@/assets/sidebars-left-second.png');
            &:hover {
              // background-image: url('~@/assets/sidebars-left-second_hover.png');
            }
            width: 108%;
          }
          &.third {
            // background-image: url('~@/assets/sidebars-left-third.png');
            &:hover {
              // background-image: url('~@/assets/sidebars-left-third_hover.png');
            }
          }
        }
      }
    }
    &.right {
      // background-image: url('~@/assets/sidebars-right.png');
      .animeMove-side {
        &-item {
          &.first {
            // background-image: url('~@/assets/sidebars-right-first.png');
            &:hover {
              // background-image: url('~@/assets/sidebars-right-first_hover.png');
            }
          }
          &.second {
            // background-image: url('~@/assets/sidebars-right-second.png');
            &:hover {
              // background-image: url('~@/assets/sidebars-right-second_hover.png');
            }
            // width: 108%;
            // transform: translateX(-8%);
          }
          &.third {
            // background-image: url('~@/assets/sidebars-right-third.png');
            &:hover {
              // background-image: url('~@/assets/sidebars-right-third_hover.png');
            }
          }
        }
      }
    }
  }
</style>
