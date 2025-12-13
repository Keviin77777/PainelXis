import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Tv, TrendingUp, AlertCircle, DollarSign, UserPlus, Activity } from 'lucide-react'
import api from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data } = await api.get('/dashboard')
      console.log('Dashboard data:', data)
      console.log('Tests:', data?.tests)
      setStats(data)
      setIsConfigured(data?.is_configured || false)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      setIsConfigured(false)
    } finally {
      setLoading(false)
    }
  }

  const connectionData = [
    { time: '11', atual: 1, anterior: 1 },
    { time: '12', atual: 2, anterior: 1 },
    { time: '13', atual: 1, anterior: 2 },
    { time: '14', atual: 3, anterior: 2 },
    { time: '15', atual: 2, anterior: 3 },
    { time: '16', atual: 4, anterior: 2 },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const clientsTotal = stats?.clients?.total || { active: 0, inactive: 0, total: 0 }
  const resellersTotal = stats?.resellers?.total || { active: 0, inactive: 0, total: 0 }

  return (
    <div className="space-y-6">
      {!isConfigured && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm text-cyan-900 dark:text-cyan-300 font-medium">
                Novas informações foram adicionadas. Clique aqui para ver.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total de Clientes */}
        <StatsCard
          icon={Users}
          title="TOTAL DE CLIENTES"
          value={clientsTotal.total}
          iconBg="bg-cyan-100 dark:bg-cyan-900/30"
          iconColor="text-cyan-600 dark:text-cyan-400"
        />

        {/* Total de Clientes Ativos */}
        <StatsCard
          icon={Activity}
          title="TOTAL DE CLIENTES ATIVOS"
          value={clientsTotal.active}
          iconBg="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
        />

        {/* Total de Revendas */}
        <StatsCard
          icon={UserPlus}
          title="TOTAL DE REVENDAS"
          value={resellersTotal.total}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />

        {/* Total de Novos Clientes */}
        <StatsCard
          icon={TrendingUp}
          title="TOTAL DE NOVOS CLIENTES"
          value={stats?.connections?.current || 0}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========== COLUNA ESQUERDA - CLIENTES ========== */}
        <div className="lg:col-span-2 space-y-6">{/* Seção Estatísticas de Clientes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">ESTATÍSTICAS DE CLIENTES</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniStatCard
                icon={Users}
                label="TOTAL DE CLIENTES"
                value={clientsTotal.total}
                iconColor="text-cyan-500"
              />
              <MiniStatCard
                icon={Activity}
                label="TOTAL DE CLIENTES ATIVOS"
                value={clientsTotal.active}
                iconColor="text-cyan-500"
              />
              <MiniStatCard
                icon={Tv}
                label="TOTAL DE TESTES"
                value={0}
                iconColor="text-cyan-500"
              />
              <MiniStatCard
                icon={UserPlus}
                label="TOTAL DE NOVOS CLIENTES"
                value={stats?.connections?.current || 0}
                iconColor="text-cyan-500"
              />
            </div>
          </div>

          {/* Gráfico de Estatísticas do Mês */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">ESTATÍSTICAS DO MÊS</h2>
              <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2">
                <TrendingUp size={16} />
                VER MAIS
              </button>
            </div>
            
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={connectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="atual" 
                  stroke="#06b6d4" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#06b6d4' }}
                  name="Clientes IPTV"
                />
                <Line 
                  type="monotone" 
                  dataKey="anterior" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6' }}
                  name="Testes IPTV"
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Clientes IPTV: 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Testes IPTV: 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Revendedores: 0</span>
              </div>
            </div>
          </div>

          {/* Expiram em 10 Dias */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">EXPIRAM EM 10 DIAS</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Login</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Vencimento</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="3" className="text-center py-8">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Não foram encontrados resultados</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Mostrando de 0 até 0 de 0 registros
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
              <span>Anterior | Seguinte</span>
            </div>
          </div>
        </div>

        {/* ========== COLUNA DIREITA - SIDEBAR ========== */}
        <div className="space-y-6">
          {/* Testes Rápidos */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">TESTE RÁPIDO</h2>
            
            {stats?.tests && stats.tests.length > 0 ? (
              <div className="space-y-3">
                {stats.tests.map((test, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{test.name}</span>
                    </div>
                    <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-medium rounded">
                      {test.server_name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center">
                  <Tv size={24} className="text-gray-400 dark:text-slate-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Nenhum teste configurado</p>
                <p className="text-xs text-gray-500 dark:text-slate-500">Configure seus planos de teste para visualizá-los aqui</p>
              </div>
            )}
          </div>

          {/* Botão Adicionar Cliente */}
          <button
            onClick={() => window.location.href = '/clients'}
            className="w-full group relative overflow-hidden bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="relative flex items-center justify-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <UserPlus size={22} className="text-gray-700 dark:text-gray-300" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900 dark:text-white">ADICIONAR CLIENTE</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Criar novo cliente no sistema</p>
              </div>
            </div>
          </button>

          {/* Créditos Disponíveis */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">Créditos Disponíveis</p>
                <p className="text-3xl font-bold">R$ {stats?.credits || '0,00'}</p>
              </div>
            </div>
            <p className="text-xs opacity-80">Não reembolsável faturado - Próximos 30 dias</p>
          </div>

          {/* Revendedores */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">REVENDEDORES</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Total de Revendedores</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{resellersTotal.total}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Revendedores Ativos</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">{resellersTotal.active}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Revendedores Inativos</span>
                <span className="text-lg font-bold text-red-600 dark:text-red-400">{resellersTotal.inactive}</span>
              </div>
            </div>
          </div>

          {/* Créditos Consumidos */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">CRÉDITOS CONSUMIDOS</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Últimos 30 Dias</p>
            
            <div className="text-center py-6">
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">R$ {stats?.credits_consumed || '0,00'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ icon: Icon, title, value, iconBg, iconColor }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon size={28} className={iconColor} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  )
}

function MiniStatCard({ icon: Icon, label, value, iconColor }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
      <div className="flex flex-col items-center text-center gap-2">
        <Icon size={32} className={iconColor} />
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{label}</p>
        </div>
      </div>
    </div>
  )
}
