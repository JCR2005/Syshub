import { createRouter, createWebHistory } from 'vue-router'
import LoginRegister from '../views/LoginRegister.vue'
import Dashboard from '../views/Dashboard.vue'
import CompleteProfile from '../views/CompleteProfile.vue'
import Profile from '../views/Profile.vue'
import RepositoryDetail from '../views/RepositoryDetail.vue'
import RepositoryCommits from '../views/RepositoryCommits.vue'
import AdminPortal from '../views/AdminPortal.vue'
import Sysreditt from '../views/Sysreditt.vue'  
import BlogEditor from '../views/BlogEditor.vue'
import BlogReader from '../views/BlogReader.vue'
import Uploadresource from '../views/Uploadresource.vue'  
import EspacioCurso from '../views/EspacioCurso.vue'
import Espaciodetalle from '../views/Espaciodetalle.vue'
import Createespacio from '../views/Createespacio.vue'

import {
  clearAuthSession,
  getActiveMode,
  hasRole,
  hasValidSession,
} from '../utils/authSession'

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
  },
  {
    path: '/complete-profile',
    name: 'complete-profile',
    component: CompleteProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
  ,
  {
    path: '/repositories/:id',
    name: 'repository-detail',
    component: RepositoryDetail,
    meta: { requiresAuth: true }
  }
  ,
  {
    path: '/repositories/:id/commits',
    name: 'repository-commits',
    component: RepositoryCommits,
    meta: { requiresAuth: true }
  }
  ,
  {
    path: '/upload-repo',
    name: 'upload-repo',
    component: () => import('../views/UploadRepository.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin-portal',
    component: AdminPortal,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
   {
    path: '/Sysreditt',
    name: 'Sysreditt',
    component: Sysreditt,
    meta: { requiresAuth: true }
  },
  {
    path: '/blogs/new',
    name: 'blog-create',
    component: BlogEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/blogs/:id/edit',
    name: 'blog-edit',
    component: BlogEditor,
    meta: { requiresAuth: true }
  },
  {
    path: '/blogs/:id',
    name: 'blog-read',
    component: BlogReader,
    meta: { requiresAuth: true }
  },
  {
    path: '/cargarRecurso',
    name: 'cargar-recurso',
    component: Uploadresource,
    meta: { requiresAuth: true }
  },
  {
    path: '/espacios-curso',
    name: 'espacios-curso',
    component: EspacioCurso,
    meta: { requiresAuth: true }
  },
  {
    path: '/curso-espacios/:id',
    name: 'espacio-detalle',
    component: Espaciodetalle,
    meta: { requiresAuth: true }
  },
  {
    path: '/curso-espacios/crear',
    name: 'crear-espacio',
    component: Createespacio,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const hasSession = () => {
  const valid = hasValidSession()
  if (!valid) {
    clearAuthSession()
  }
  return valid
}

const hasAdminMode = () => {
  return getActiveMode() === 'admin' && hasRole('admin')
}

const defaultRouteForSession = () => {
  return hasAdminMode() ? { name: 'admin-portal' } : { name: 'dashboard' }
}

router.beforeEach((to) => {
  if (to.meta?.requiresAuth && !hasSession()) {
    return { name: 'login' }
  }
  if (to.meta?.requiresAdmin && !hasAdminMode()) {
    return { name: 'dashboard' }
  }
  if (to.name === 'login' && hasSession()) {
    return defaultRouteForSession()
  }
  return true
})

export default router
