import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Home, Users, Tv, Moon, Sun, LogOut, Settings, Bell, CreditCard, MessageSquare, 
  User, Shield, BarChart3, FileText, Package, Activity, Trash2, Tag, RefreshCw, 
  Move, Clock, List, History, DollarSign, Link2, Upload, Download, Server,
  Layers, Palette, Database, Globe, AlertCircle, Copy, Calendar
} from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

export default function Layout() {
  const location = useLocation()
  const { isDark, toggleTheme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const [sessionsCount, setSessionsCount] = useState(0)

  useEffect(() => {
    loadSessionsCount()
  }, [])

  const loadSessionsCount = async () => {
    try {
      const { data } = await api.get('/sessions/count')
      setSessionsCount(data.count)
    } catch (error) {
      console.error('Erro ao carregar contagem de sessões:', error)
    }
  }

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
        { name: 'Sessões Ativas', href: '/sessions', icon: Activity, badge: sessionsCount > 0 ? sessionsCount.toString() : null },
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

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1d29] dark:bg-gray-800 border-r border-[#252836] dark:border-gray-700 flex flex-col h-full shadow-2xl">
        {/* Header fixo */}
        <div className="p-6 border-b border-[#252836] dark:border-gray-700 flex-shrink-0">
          <h1 className="text-2xl font-bold text-white">Painel</h1>
          <p className="text-sm text-gray-400">Revendedores</p>
        </div>
        
        {/* Menu com scroll */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-[#252836] dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-[#2d3142] dark:hover:scrollbar-thumb-gray-500">
          {menuCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-6">
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {category.title}
              </h3>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'text-gray-400 hover:bg-[#252836] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {menuCategories.flatMap(c => c.items).find(n => n.href === location.pathname)?.name || 'Dashboard'}
            </h2>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
