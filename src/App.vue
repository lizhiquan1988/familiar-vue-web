<template>
  <p>子供の見守り</p>
  <MapboxMap />
  <PageEnd />
</template>

<script>
import MapboxMap from './components/MapboxMap.vue'
import PageEnd from './components/PageEnd.vue'

export default {
  name: 'App',
  components: {
    MapboxMap,
    PageEnd
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
