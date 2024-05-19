import { createWebHistory, createRouter } from 'vue-router'

import Home from './src/views/Home.vue'
import Admin from './src/views/Admin.vue'

const routes = [
  { path: '/admin', component: Admin },
  { path: '/', component: Home }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router