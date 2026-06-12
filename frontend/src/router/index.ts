import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const Home = () => import('../pages/Home.vue')
const Login = () => import('../pages/Login.vue')
const Businesses = () => import('../pages/Businesses.vue')
const Circles = () => import('../pages/Circles.vue')
const Offline = () => import('../pages/Offline.vue')
const NotFound = () => import('../pages/NotFound.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/businesses',
      name: 'Businesses',
      component: Businesses,
      meta: { requiresAuth: true }
    },
    {
      path: '/circles',
      name: 'Circles',
      component: Circles,
      meta: { requiresAuth: true }
    },
    {
      path: '/offline',
      name: 'Offline',
      component: Offline
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
