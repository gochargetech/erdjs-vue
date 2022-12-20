import { createWebHistory, createRouter } from "vue-router";


import { HomePage } from './../components/HomePage'
import { LoginPage } from './../components/LoginPage'

const routes = [
  {
    path: '/',
    component: HomePage,
    name: 'home'
  },
  {
    path: '/login',
    component: LoginPage,
    name: 'login'
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router;