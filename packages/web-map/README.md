| Key 名称     | Key                              | 绑定服务 |
| ------------ | -------------------------------- | -------- |
| webjs_mapkey | d3fcaebb2ce850826758ed089c9a8132 | Web 端   |

## 配置

### config   `main.js`

```js
window._AMapSecurityConfig = {
  securityJsCode: '1cdceeded4002f68832d52b0071f61cf'
}
Vue.prototype.$amapKey = "d3fcaebb2ce850826758ed089c9a8132";
// Vue.prototype.$amapCenter = [113.267021, 23.113628]// gz
// Vue.prototype.$amapCenter = [119.930906,30.869838]// hz
Vue.prototype.$amapCenter = [109.774249,39.618631]// eeds
```

### props

version

plugins:[string]

options:Object

> options 中的配置 会覆盖 global config 中已定义的同意义配置参数

实例：

```js
Vue.prototype.$amapKey = "d3fcaebb2ce850826758ed089c9a8132";
```

## function

### [事件](https://lbs.amap.com/api/jsapi-v2/documentation#event)
