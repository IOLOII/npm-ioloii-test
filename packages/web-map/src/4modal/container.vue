<template>
  <div
    class="webmap-wrapper-layer webmap-wrapper-modal-container"
    @click.stop="g_click('modal-layer')"
  >
    <!-- 正常dialog -->
    <div
      class="webmap-wrapper-modal-container-default"
      v-show="defaultVisible === 'show'"
      ref="default"
    >
      <div class="content">
        <div class="title">
          <span>路线名称</span>
          <Icon type="icon-close" @click.native="closeModal('default')" />
        </div>
        <img :src="require('./road.webp')" />
        <div class="tips">基础信息</div>
        <el-row>
          <el-col :span="24" :offset="0">
            <span class="prop">路线编号</span>
            <span>SFW51155</span>
          </el-col>
          <el-col :span="24" :offset="0">
            <span class="prop">行政等级</span>
            <span>国道</span>
          </el-col>
          <el-col :span="24" :offset="0">
            <span class="prop">起点桩号</span>
            <span>K0+000</span>
          </el-col>
          <el-col :span="24" :offset="0">
            <span class="prop">终点桩号</span>
            <span>K121+100</span>
          </el-col>
          <el-col :span="24" :offset="0">
            <span class="prop">所属行政区域</span>
            <span>所属行政区域</span>
          </el-col>
          <el-col :span="24" :offset="0">
            <span class="prop">技术等级</span>
            <span>技术等级</span>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
  /**
   * @author IOLOII
   * @github https://github.com/IOLOII
   * @create date 2022-04-21 14:59:59
   * @modify date 2022-04-21 14:59:59
   * @desc [管理弹出对话框，窗口信息层]
   */
  // import
  import 'element-ui/lib/theme-chalk/index.css'
  import eventBus from '../eventBus'
  import { Col, Row } from 'element-ui'
  import Icon from '../../components/icon'
  export default {
    name: 'Modal',
    components: {
      [Col.name]: Col,
      [Row.name]: Row,
      Icon
    },
    data: () => ({
      //
      //  type:'default' 'test'
      defaultVisible: false,
      modal: {}
    }),
    created() {
      this.initModalEvents()
    },
    methods: {
      g_click(v) {
        eventBus.$emit('g_click', v)
      },
      initModalEvents() {
        // value show|hide
        eventBus.$on(
          'openModal',
          ({
            type = 'default',
            html = '',
            callback = {},
            width = '300px',
            height = '400px',
            value = 'show',
            mosueEvent = {}
          }) => {
            // const { success: successHandle, fail: failHandle } = callback
            console.log(type)
            Object.assign(this.modal, {
              [type]: {
                type,
                html,
                callback,
                width,
                height,
                value,
                mosueEvent
              }
            })
            this[type + 'Visible'] = value
            // onClickOutside(this.$refs.default, event => console.log(event))
          }
        )
      },
      closeModal(type) {
        this[type + 'Visible'] = 'hide'
        this.modal[type].callback.success()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../css/main.scss';
</style>
