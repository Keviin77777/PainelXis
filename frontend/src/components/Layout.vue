<template>
  <div class="h-screen flex overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-[270px] bg-neutral-900 dark:bg-neutral-950 border-r border-neutral-700 dark:border-neutral-800 flex flex-col h-full shadow-2xl">
      <!-- Header fixo -->
      <div class="p-6 border-b border-neutral-700 dark:border-neutral-800 flex-shrink-0">
        <h1 class="text-2xl font-bold text-white">Painel</h1>
        <p class="text-sm text-gray-400">Revendedores</p>
      </div>
      
      <!-- Menu com scroll -->
      <nav 
        class="flex-1 overflow-y-auto px-4 py-6"
        style="scrollbar-width: thin; scrollbar-color: #808290 transparent;"
      >
        <div v-for="(category, categoryIndex) in menuCategories" :key="categoryIndex" class="mb-6">
          <h3 class="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {{ category.title }}
          </h3>
          <div class="space-y-1">
            <router-link
              v-for="item in category.items"
              :key="item.name"
              :to="item.href"
              class="flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200"
              :class="isActive(item.href) 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:bg-neutral-800 hover:text-white'"
            >
              <div class="flex items-center gap-3">
                <component :is="item.icon" :size="20" />
                <span class="text-base font-medium">{{ item.name }}</span>
              </div>
              <span v-if="item.badge" class="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                {{ item.badge }}
              </span>
            </router-link>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-full overflow-hidden">
      <!-- Header -->
      <header class="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 px-6 py-4 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            {{ currentPageName }}
          </h2>
          
          <div class="flex items-center gap-4">
            <button
              @click="themeStore.toggleTheme()"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
            >
              <Sun v-if="themeStore.isDark" :size="20" />
              <Moon v-else :size="20" />
            </button>
            
            <div class="flex items-center gap-3">
              <div class="text-right">
                <p class="text-sm font-medium">{{ authStore.user?.name }}</p>
                <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
              </div>
              <button
                @click="handleLogout"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-red-600"
              >
                <LogOut :size="20" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-neutral-950">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  Home, Users, Moon, Sun, LogOut, Settings, Bell, CreditCard, MessageSquare, 
  User, Shield, BarChart3, FileText, Package, Activity, Trash2, RefreshCw, 
  Move, History, DollarSign, Server, Layers, Palette, Globe, AlertCircle, Copy, Calendar, List
} from 'lucide-vue-next'
import { useThemeStore } from '../stores/themeStore'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const sessionsCount = ref(0)

const menuCategories = [
  {
    title: 'Painel',
    items: [
      { name: 'Dashboard', href: '/', icon: Home },
      { name: 'Avisos', href: '/notices', icon: Bell },
      { name: 'Comprar Créditos', href: '/buy-credits', icon: CreditCard },
      { name: 'Tickets de Suporte', href: '/tickets', icon: MessageSquare },
      { name: 'Perfil', href: '/profile', icon: User },
      { name: 'Segurança da Conta', href: '/security', icon: Shield },
      { name: 'Sessões Ativas', href: '/sessions', icon: Activity, badge: computed(() => sessionsCount.value > 0 ? sessionsCount.value.toString() : null) },
    ]
  },
  {
    title: 'Clientes',
    items: [
      { name: 'Clientes', href: '/clients', icon: Users },
      { name: 'Conexões Ao Vivo', href: '/live-connections', icon: Activity },
      { name: 'Estatísticas de Clientes', href: '/clients/stats', icon: BarChart3 },
      { name: 'Excluído', href: '/clients/deleted', icon: Trash2 },
      { name: 'Migração de Cliente', href: '/clients/migration', icon: RefreshCw },
      { name: 'Mover Clientes', href: '/clients/move', icon: Move },
    ]
  },
  {
    title: 'Revendas',
    items: [
      { name: 'Revendas', href: '/resellers', icon: Users },
      { name: 'Transações de Créditos', href: '/credit-transactions', icon: DollarSign },
      { name: 'Renovar Mensalistas', href: '/renew-monthly', icon: RefreshCw },
      { name: 'Mover Revendas', href: '/move-resellers', icon: Move },
      { name: 'Histórico de Logins', href: '/login-history', icon: History },
    ]
  },
  {
    title: 'Relatórios',
    items: [
      { name: 'Novos Conteúdos', href: '/new-content', icon: FileText },
      { name: 'Estatísticas dos Servidores', href: '/server-stats', icon: Server },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { name: 'Servidores', href: '/servers', icon: Server },
      { name: 'Planos', href: '/plans', icon: Layers },
      { name: 'Pacotes (Preço)', href: '/packages-price', icon: Package },
      { name: 'Pacote de Créditos', href: '/credit-packages', icon: CreditCard },
      { name: 'Pacote de Créditos (Preço)', href: '/credit-packages-price', icon: DollarSign },
      { name: 'Planos Mensalista', href: '/monthly-plans', icon: Calendar },
      { name: 'Permissões', href: '/permissions', icon: Shield },
      { name: 'Template de Playlist Padrão', href: '/playlist-template', icon: List },
    ]
  },
  {
    title: 'Configurações',
    items: [
      { name: 'Geral', href: '/settings/general', icon: Settings },
      { name: 'Clientes', href: '/settings/clients', icon: Users },
      { name: 'Revendas', href: '/settings/resellers', icon: Users },
      { name: 'Domínios', href: '/settings/domains', icon: Globe },
      { name: 'Notificações', href: '/settings/notifications', icon: Bell },
      { name: 'Manutenção', href: '/settings/maintenance', icon: AlertCircle },
      { name: 'Estilo', href: '/settings/style', icon: Palette },
      { name: 'Domínio', href: '/settings/domain', icon: Globe },
      { name: 'Copiar Servidor', href: '/settings/copy-server', icon: Copy },
      { name: 'Copiar Configurações', href: '/settings/copy-settings', icon: Copy },
    ]
  }
]

const currentPageName = computed(() => {
  const allItems = menuCategories.flatMap(c => c.items)
  return allItems.find(n => n.href === route.path)?.name || 'Dashboard'
})

function isActive(href) {
  return route.path === href
}

async function loadSessionsCount() {
  try {
    const { data } = await api.get('/sessions/count')
    sessionsCount.value = data.count
  } catch (error) {
    console.error('Erro ao carregar contagem de sessões:', error)
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadSessionsCount()
})
</script>


<style>
/* Scrollbar customizada para a sidebar - cores bem visíveis */
.sidebar-scroll::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
}

.sidebar-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05) !important;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3) !important;
  border-radius: 4px !important;
}

.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5) !important;
}

/* Firefox */
.sidebar-scroll {
  scrollbar-width: thin !important;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent !important;
}

.sidebar-scroll:hover {
  scrollbar-color: rgba(255, 255, 255, 0.5) transparent !important;
}
</style>
