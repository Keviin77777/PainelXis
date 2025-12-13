import { useState, useEffect } from 'react'
import { Activity, Search, RefreshCw, AlertCircle, Settings, Wifi } from 'lucide-react'
import { useNotificationStore } from '../store/notificationStore'
import api from '../services/api'

export default function LiveConnections() {
  const { addNotification } = useNotificationStore()
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    loadConnections()
    
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        loadConnections()
      }, 30000) // Atualiza a cada 30 segundos
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const loadConnections = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/live-connections')
      setConnections(data.data || [])
      setIsConfigured(data.is_configured !== false)
    } catch (error) {
      console.error('Erro ao carregar conexões:', error)
      setIsConfigured(false)
    } finally {
      setLoading(false)
    }
  }

  const filteredConnections = connections.filter(conn =>
    conn.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.server?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.ip?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && connections.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Se não estiver configurado
  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Activity size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Conexões Ao Vivo</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Monitore as conexões ativas em tempo real
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 shadow-sm">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
              <AlertCircle size={48} className="text-blue-600 dark:text-blue-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Servidor Não Configurado
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Configure um servidor para visualizar as conexões ao vivo dos seus clientes.
            </p>

            <a
              href="/servers"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Settings size={20} />
              Configurar Servidor
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Activity size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Conexões Ao Vivo</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Monitore as conexões ativas em tempo real
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Auto-atualizar</span>
            </label>
            
            <button
              onClick={loadConnections}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            As informações abaixo são atualizadas a cada 1 minuto. A lista é recarregada a cada 30 segundos. Não é necessário atualizar a página.
          </p>
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar por usuário, servidor ou IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors">
            Limpar Filtro
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Conexões / Máx
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Revenda
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Assistindo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Tempo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Dispositivo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredConnections.length > 0 ? (
                filteredConnections.map((conn, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {conn.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {conn.connections} / {conn.max_connections}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {conn.reseller || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="max-w-xs truncate">
                        {conn.watching || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {conn.time || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="max-w-md truncate">
                        {conn.device || '-'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                        <Wifi size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Nenhuma conexão ativa
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Não há clientes conectados no momento
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer com total */}
        {filteredConnections.length > 0 && (
          <div className="bg-gray-50 dark:bg-slate-700/30 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total: <span className="font-semibold text-gray-900 dark:text-white">{filteredConnections.length}</span> conexões ativas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
