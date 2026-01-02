import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Layout from '../components/Layout.vue'
import Login from '../pages/Login.vue'
import Dashboard from '../pages/Dashboard.vue'
import Notices from '../pages/Notices.vue'
import Tickets from '../pages/Tickets.vue'
import BuyCredits from '../pages/BuyCredits.vue'
import Profile from '../pages/Profile.vue'
import Security from '../pages/Security.vue'
import Sessions from '../pages/Sessions.vue'
import Clients from '../pages/Clients.vue'
import ClientAdd from '../pages/ClientAdd.vue'
import Servers from '../pages/Servers.vue'
import LiveConnections from '../pages/LiveConnections.vue'
import Plans from '../pages/Plans.vue'
import Lines from '../pages/Lines.vue'
import Users from '../pages/Users.vue'
import Settings from '../pages/Settings.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'notices', name: 'Notices', component: Notices },
      { path: 'tickets', name: 'Tickets', component: Tickets },
      { path: 'buy-credits', name: 'BuyCredits', component: BuyCredits },
      { path: 'profile', name: 'Profile', component: Profile },
      { path: 'security', name: 'Security', component: Security },
      { path: 'sessions', name: 'Sessions', component: Sessions },
      { path: 'clients', name: 'Clients', component: Clients },
      { path: 'clients/add', name: 'ClientAdd', component: ClientAdd },
      { path: 'servers', name: 'Servers', component: Servers },
      { path: 'live-connections', name: 'LiveConnections', component: LiveConnections },
      { path: 'plans', name: 'Plans', component: Plans },
      { path: 'lines', name: 'Lines', component: Lines },
      { path: 'users', name: 'Users', component: Users },
      { path: 'settings', name: 'Settings', component: Settings }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login')
  } else if (to.path === '/login' && authStore.token) {
    next('/')
  } else {
    next()
  }
})

export default router
