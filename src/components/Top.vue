<template>
  <p>子供の見守り</p>
  <MapboxMap />
  <PageEnd />
</template>

<script>
import MapboxMap from './MapboxMap.vue'
import PageEnd from './PageEnd.vue'

export default {
  name: 'TopPage',
  components: {
    MapboxMap,
    PageEnd
  }
}
</script>
