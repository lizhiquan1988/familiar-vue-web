import { createRouter, createWebHistory } from 'vue-router'
import Top from '../components/Top.vue'
import Registration from '../components/Registration.vue'
import Login from '../components/Login.vue'
import NotFound from '../components/NotFound.vue'
const routes = [
  {
    path: '/',
    name: 'top',
    component: Top
  },
  {
    path: '/registration',
    name: 'register',
    component: Registration
  },
  {
    path: '/loginPage',
    name: 'login',
    component: Login
  },
  {
    path: '/doLogin/:userId/:password',
    name: 'doLogin',
    component: Login,
    props: route => ({ userId: route.params.userId, password: route.params.password })
  },
  {
    path:'/error',
    component:NotFound
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
