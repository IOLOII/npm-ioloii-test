<template>
  <div style="width: inherit; padding: 0 20px" class="supendedLeft">
    <el-input
      placeholder="所属行政区域"
      v-model="input3"
      class="input-with-select"
      clearable
    >
      <el-button
        slot="append"
        icon="el-icon-search"
        @click="search"
        size="medium"
      ></el-button>
    </el-input>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="图层图层图层" name="second">
        <TreePick ref="TreePick" />
      </el-tab-pane>
      <el-tab-pane label="搜索" name="third">
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
            <el-form ref="form1" :model="form1">
              <el-form-item>
                <el-select clearable v-model="form1.model1" placeholder="搜索类型">
                  <el-option label="label" value="value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-select clearable v-model="form1.model1" placeholder="选择路线">
                  <el-option label="label" value="value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-select clearable v-model="form1.model1" placeholder="搜索内容">
                  <el-option label="label" value="value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-input
                  clearable
                  v-model="form1.model1"
                  placeholder="输入桩号"
                ></el-input>
              </el-form-item>
            </el-form>
            <el-button type="primary">搜索</el-button>
          </el-collapse-item>
          <el-collapse-item name="2">
            <template slot="title">
              <span>路线路况</span>
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
                <el-select clearable v-model="form2.model1" placeholder="搜索类型">
                  <el-option label="label" value="value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-select clearable v-model="form2.model1" placeholder="选择路线">
                  <el-option label="label" value="value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-select clearable v-model="form2.model1" placeholder="搜索内容">
                  <el-option label="label" value="value"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <el-button type="primary">搜索</el-button>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  // import
  import TreePick from './treePick'
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
    data: () => ({
      input3: '',
      activeName: 'second',
      activeNames: [],
      form1: {
        model1: ''
      },
      form2: {
        model1: ''
      }
    }),
    methods: {
      search() {
        console.log(this.input3)
      },
      handleClick() {},
      handleChange() {}
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
</style>
