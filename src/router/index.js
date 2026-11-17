import { createRouter, createWebHistory } from 'vue-router'
import MapboxMap from '../components/MapboxMap.vue'
import PlayVideo from '../components/PlayVideo.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MapboxMap
  },
  {
    path: '/playvideo',
    name: 'PlayVideo',
    component: PlayVideo
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
