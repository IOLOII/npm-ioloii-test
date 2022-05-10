<template>
  <div style="width: inherit; padding: 0 20px" class="supendedLeft">
    <el-input
      placeholder="所属行政区域"
      v-model="topSearch"
      class="input-with-select"
      clearable
    >
      <el-button
        slot="append"
        icon="el-icon-search"
        @click="search"
        size="medium"
        class="cus-button"
      ></el-button>
    </el-input>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="图层" name="first">
        <TreePick ref="TreePick" />
      </el-tab-pane>
      <el-tab-pane label="搜索" name="second">
        <el-collapse v-model="activeNames" @change="handleChange" accordion>
          <el-collapse-item name="1">
            <template slot="title">
              <span>搜索工具</span>
              <el-tooltip
                class="item"
                effect="dark"
                content="搜索工具"
                placement="right"
                :enterable="false"
              >
                <i class="header-icon el-icon-info"></i>
              </el-tooltip>
            </template>
            <el-form ref="form1" :model="form1" :rules="form1Rule">
              <el-form-item prop="type">
                <el-select
                  clearable
                  v-model="form1.type"
                  placeholder="请选择 搜索类型"
                  filterable
                >
                  <el-option
                    :label="op.label"
                    :value="op.value"
                    v-for="(op, opindex) in options.type"
                    :key="opindex"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="lineType">
                <el-select
                  clearable
                  v-model="form1.lineType"
                  placeholder="请选择 路线"
                  filterable
                >
                  <el-option
                    :label="ltp.label"
                    :value="ltp.value"
                    v-for="(ltp, ltpindex) in options.lineType"
                    :key="ltpindex"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="stake">
                <el-input
                  clearable
                  v-model="form1.stake"
                  placeholder="请输入 桩号(如：3.123)"
                ></el-input>
              </el-form-item>
              <el-form-item prop="search">
                <el-select
                  clearable
                  v-model="form1.search"
                  placeholder="请输入 搜索内容"
                  filterable
                >
                  <el-option
                    :label="sc.label"
                    :value="sc.value"
                    v-for="(sc, scindex) in options.search"
                    :key="scindex"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <el-button type="primary" @click="search(1)">搜索</el-button>
          </el-collapse-item>
          <el-collapse-item name="2">
            <template slot="title">
              <span>路线路况 开发中</span>
              <el-tooltip
                class="item"
                effect="dark"
                content="路线路况"
                placement="right"
                :enterable="false"
              >
                <i class="header-icon el-icon-info"></i>
              </el-tooltip>
            </template>
            <el-form ref="form2" :model="form2">
              <el-form-item>
                <el-select clearable v-model="form2.type" placeholder="搜索类型 开发中">
                  <el-option label="label" value="value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-select
                  clearable
                  v-model="form2.lineType"
                  placeholder="选择路线 开发中"
                >
                  <el-option label="label" value="value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-select clearable v-model="form2.search" placeholder="搜索内容 开发中">
                  <el-option label="label" value="value"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <el-button type="primary" @click="search(2)">搜索 开发中</el-button>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import axios from 'axios'
  // import
  import TreePick from './treePick'
  import eventBus from '../eventBus'
  export default {
    name: 'SupendedLeft',
    components: {
      TreePick
    },
    props: {
      metaConfig: {
        type: Object,
        required: false
      }
    },
    inject: ['tempToken', 'tempService'],
    data: () => ({
      topSearch: '',
      activeName: 'first',
      activeNames: [],
      form1: {
        type: '',
        lineType: '',
        stake: '',
        search: ''
      },
      form1Rule: {
        search: [{ required: true, message: '请输入搜索内容', trigger: 'blur' }]
      },
      form2: {
        type: '',
        lineType: '',
        search: ''
      },
      options: {
        type: [
          // { label: '路线', value: '路线' },

          // /api/pc/pcHome/queryHomePoint
          { label: '桥梁', value: '桥梁' },
          { label: '隧道', value: '隧道' },
          { label: '涵洞', value: '涵洞' },

          // 路产
          // /api/pc/pcHome/highwayProperty
          // { label: '交通标志', value: 'tpLabel' },
          // { label: '标线', value: 'tpMarking' },
          // { label: '护栏', value: 'tpGuardrail' },
          // { label: '防护设施', value: 'tpSavefacilities' },
          // { label: '照明设施', value: 'tpLighting' },
          // { label: '排水设施', value: 'tpDrainage' },
          // { label: '收费站', value: 'tpTollStation' },
          // { label: '服务站', value: 'tpSst' },
          // { label: '加油站', value: 'tpPetrolStation' },
          // { label: '停车区', value: 'tpParkingLot' },
          // { label: '治超站点', value: 'tpSuper' },
          // { label: '公路管理站', value: 'tpStation' },
          // { label: '桥梁养护牌', value: 'tpPlate' },
          // { label: '监控设备', value: 'tpCamera' }
        ],
        lineType: [
          { label: '国道', value: 'G' },
          { label: '省道', value: 'S' },
          { label: '县道', value: 'X' },
          { label: '乡道', value: 'Y' },
          { label: '村道', value: 'C' },
          { label: '专用公路', value: 'Z' }
        ],
        search: []
      }
    }),
    watch: {
      'form1.type': {
        handler(v, ov) {
          if (v.type !== '' && v.type !== '路线') {
            this.getSearchOptions(1)
          } else if (v.type == '路线') {
          }
        }
      },
      'form1.lineType': {
        handler(v, ov) {
          if (v.type !== '' && v.type !== '路线') {
            this.getSearchOptions(1)
          } else if (v.type == '路线') {
          }
        }
      },
      'form1.stake': {
        handler(v, ov) {
          if (v.type !== '' && v.type !== '路线') {
            this.getSearchOptions(1)
          } else if (v.type == '路线') {
          }
        }
      }
    },
    methods: {
      search(type) {
        switch (type) {
          case 1:
            this.$refs['form1'].validate(valid => {
              if (valid) {
                if (this.point) {
                  this.point.marker.setMap(null)
                }
                this.point = null
                this.point = this.options.search.find(item => {
                  return item.value == this.form1.search
                })
                if (this.point) {
                  console.log(this.point)
                  eventBus.$emit('draw', {
                    eventType: 'point',
                    eventName: 'leftSearchOnePoint',
                    eventObj: {
                      point: this.point
                    }
                  })
                  // setTimeout(() => {
                  //   console.log('point', this.point)
                  // }, 2000)
                  // 绘制点在map上
                } else {
                  this.$message({
                    message: '查询无果',
                    type: 'success'
                  })
                }
              } else {
                return false
              }
            })
            // 需要校验，且必须选中一条数据
            console.log(this.form1)
            break
          case 2:
            console.log(this.form2)
            break
        }
        console.log(this.topSearch)
      },
      getSearchOptions(formT) {
        let config = {
          method: 'post',
          // url: this.tempService + '/api/pc/pcHome/queryHomePoint',
          headers: {
            token: this.tempToken,
            'Content-Type': 'application/json'
          }
        }
        switch (formT) {
          case 1:
            this.form1.search = ''
            if (
              this.form1.type === '桥梁' ||
              this.form1.type === '隧道' ||
              this.form1.type === '涵洞'
            ) {
              config = Object.assign({}, config, {
                url: this.tempService + '/api/pc/pcHome/queryHomePoint',
                data: {
                  type: [this.form1.type],
                  administrativeGrade: [this.form1.lineType],
                  stake: this.form1.stake,
                  areaIds: [],
                  culvertLocation: [],
                  id: '',
                  no: '',
                  officeId: '',
                  roadNo: '',
                  spanType: [],
                  technicalRating: [],
                  tunnelTypeCode: []
                }
              })
              axios(config)
                .then(response => {
                  this.options.search = []
                  response.data.forEach(item => {
                    item = JSON.parse(decodeURIComponent(item))
                    console.log(item)
                    item.features.forEach((point, index) => {
                      point.types = this.form1.type
                      if (
                        point.geometry &&
                        point.geometry.coordinates[1] &&
                        point.geometry.coordinates[0]
                      ) {
                        this.options.search.push({
                          label: point.properties.name,
                          value: point.properties.id.toString(),
                          // value: point.properties.name,
                          target: point
                        })
                      }
                    })
                  })
                  console.log(this.options.search)
                })
                .catch(err => {})
                .finally(() => {})
            } else {
              // 不可行 需要其他字段查询
              // this.options.search = []
              // let emptyObj = {
              //   amapMakersManage: {},
              //   keys: ['amapMakersManage']
              // }
              // eventBus.$emit('getProp', { emptyObj })
              // let amapMakersManage = emptyObj.amapMakersManage
              // console.log(amapMakersManage)
              // let temparr = {}
              // Object.keys(amapMakersManage['路产']).forEach(key => {
              //   amapMakersManage['路产'][key]
              //   Object.assign(
              //     temparr,
              //     JSON.parse(JSON.stringify(amapMakersManage['路产'][key]))
              //   )
              // })
              // this.options.search = temparr[this.form1.type].map(item => {
              //   return {
              //     label: item.properties.name || item.properties.id + '暂无名称',
              //     value: item.properties.id,
              //     target: item
              //   }
              // })
              // amapMakersManage["路产"][key] find
            }
            break
          case 2:
            this.form2.search = ''
            break
        }
      },
      handleClick(tab, event) {
        console.log(tab, event)
        if (this.point) {
          this.point.marker.setMap(null)
          this.point = null
        }
      },
      handleChange(name) {
        switch (name) {
          case '1':
            setTimeout(() => {
              this.form2.type = ''
              this.form2.lineType = ''
              this.form2.search = ''
            }, 300)
            break
          case '2':
            setTimeout(() => {
              this.form1.type = ''
              this.form1.lineType = ''
              this.form1.search = ''
              this.form1.stake = ''
            }, 300)
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @mixin overflow {
    overflow: auto;
    padding: 5px;
  }
  .el-button {
    width: 100%;
  }

  .el-collapse-item ::v-deep {
    .el-collapse-item__header,
    .el-collapse-item__wrap {
      background-color: transparent;
    }
  }
  .el-select {
    width: 100%;
  }
  .supendedLeft ::v-deep {
    .el-tabs.el-tabs--top {
      height: calc(100% - 40px);
    }
    .el-tabs__content {
      height: calc(100% - 55px);
      overflow-y: auto;
      @include overflow;
    }
  }
  .cus-button ::v-deep{
    i{
      padding: 5px;
    }
  }
</style>
