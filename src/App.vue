<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App'
}
</script>
<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
body {
    margin: 0;
    background: #e8e8e8 url('@/assets/img/backgroundImage.gif') center bottom;
    background-attachment: fixed;
    background-size: cover;
    min-height: 100vh;
    flex-direction: column;
}
</style>
