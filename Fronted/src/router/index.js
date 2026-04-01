import { createRouter, createWebHistory } from 'vue-router'
import LoginRegister from '../views/LoginRegister.vue'
import Dashboard from '../views/Dashboard.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginRegister
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const getToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

const hasSession = () => {
  const token = getToken()
  const user = localStorage.getItem('authUser') || sessionStorage.getItem('authUser')
  return !!token && token !== 'null' && token !== 'undefined' && !!user
}

router.beforeEach((to) => {
  if (to.meta?.requiresAuth && !hasSession()) {
    return { name: 'login' }
  }
  if (to.name === 'login' && hasSession()) {
    return { name: 'dashboard' }
  }
  return true
})

export default router
