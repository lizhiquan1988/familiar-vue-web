<template>
  <p>子供の見守り</p>
  <router-view />
  <PageEnd />
</template>

<script>
import PageEnd from './components/PageEnd.vue';

export default {
  name: 'App',
  components: {
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
