<template>
  <div class="home">
    <WebMap :metaConfig="metaConfig" geoServerUrl="http://14.18.52.99:8000/geoserver/neimenggu/wms" tempToken="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NTA1OTQxNDgsInVzZXJuYW1lIjoiYWRtaW4ifQ.KGaBeU3qirWFyy8NqUtzijYgTG9lHt_fcSv_6yctweM" geoQueryProp="ROADNAME"/>
  </div>
</template>

<script>
  // @ is an alias to /src
  import HelloWorld from '@/components/HelloWorld.vue'
  import { metaConfig } from './metaConfig'
  export default {
    name: 'Home',
    components: {
      HelloWorld
    },
    computed: {
      metaConfig() {
        return metaConfig
      }
    }
  }
</script>
<style lang="scss">
  .home {
    height: 800px;
    width: 100%;
  }
</style>
