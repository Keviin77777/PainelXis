import { useState, useEffect } from 'react'
import { Search, Filter, Plus, Edit, Trash2, Eye, Link as LinkIcon, Download, RefreshCw, CheckCircle, AlertCircle, Settings, Users, ArrowLeft, XCircle } from 'lucide-react'
import { useNotificationStore } from '../store/notificationStore'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import DateTimePicker from '../components/DateTimePicker'

export default function Clients() {
  const { addNotification } = useNotificationStore()
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)
  const [hasServers, setHasServers] = useState(false)
  const [view, setView] = useState('list') // 'list', 'form'
  const [servers, setServers] = useState([])
  const [selectedServer, setSelectedServer] = useState(null)
  const [bouquets, setBouquets] = useState([])
  const [plans, setPlans] = useState([])
  const [availablePlans, setAvailablePlans] = useState([])
  
  // Form state
  const [formData, setFormData] = useState({
    server_id: '',
    plan: '',
    connections: 1,
    username: '',
    password: '',
    expiry_date: '',
    plan_price: '',
    bouquets: [],
    name: '',
    email: '',
    telegram: '',
    whatsapp: '',
    notes: ''
  })

  useEffect(() => {
    loadClients()
  }, [currentPage, filterStatus, perPage])

  const loadClients = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/clients', {
        params: {
          page: currentPage,
          per_page: perPage,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          search: searchTerm
        }
      })
      setClients(data.data || [])
      setTotalPages(data.last_page || 1)
      setTotalRecords(data.total || 0)
      setHasServers(data.has_servers || false)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
      setHasServers(false)
    } finally {
      setLoading(false)
    }
  }

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage)
    setCurrentPage(1)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadClients()
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Ativo', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      inactive: { label: 'Inativo', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      expired: { label: 'Expirado', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
    }
    const badge = badges[status] || badges.inactive
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.class}`}>
        {badge.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const loadServers = async () => {
    try {
      const { data } = await api.get('/servers')
      setServers(data || [])
    } catch (error) {
      console.error('Erro ao carregar servidores:', error)
    }
  }

  const loadPlans = async () => {
    try {
      const { data } = await api.get('/plans')
      setPlans(data || [])
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    }
  }

  const loadServerBouquets = async (serverId, serversList = null) => {
    try {
      // Usa a lista de servidores passada ou a do estado
      const serversToUse = serversList || servers
      
      // Busca o servidor selecionado
      const server = serversToUse.find(s => s.id === parseInt(serverId))
      
      if (!server) {
        setBouquets([])
        return
      }

      // Busca todos os bouquets disponíveis
      const { data } = await api.get(`/servers/${serverId}/bouquets`)
      
      if (data.success && data.data) {
        // Filtra apenas os bouquets permitidos no servidor
        if (server.allowed_bouquets && server.allowed_bouquets.length > 0) {
          const filteredBouquets = data.data.filter(bouquet => 
            server.allowed_bouquets.includes(bouquet.id)
          )
          setBouquets(filteredBouquets)
        } else {
          // Se não houver restrição, mostra todos
          setBouquets(data.data)
        }
      } else {
        setBouquets([])
      }
    } catch (error) {
      console.error('Erro ao carregar bouquets:', error)
      setBouquets([])
    }
  }

  const handleServerChange = (serverId) => {
    setFormData({ ...formData, server_id: serverId, plan: '' })
    if (serverId) {
      loadServerBouquets(serverId)
      // Filtrar planos do servidor selecionado
      const serverPlans = plans.filter(plan => plan.server_id === parseInt(serverId) && plan.status === 'active')
      setAvailablePlans(serverPlans)
    } else {
      setAvailablePlans([])
    }
  }

  const handleCancel = () => {
    setView('list')
    setFormData({
      server_id: '',
      plan: '',
      connections: 1,
      username: '',
      password: '',
      expiry_date: '',
      plan_price: '',
      bouquets: [],
      name: '',
      email: '',
      telegram: '',
      whatsapp: '',
      notes: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      await api.post('/clients', formData)
      addNotification({
        type: 'success',
        message: 'Cliente criado com sucesso'
      })
      handleCancel()
      loadClients()
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao criar cliente'
      })
    }
  }

  const generateRandomUsername = () => {
    // Gera username: pelo menos 3 letras no início, sempre 9 caracteres total
    // Somente letras e números, sem acentos
    const letters = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    
    let username = ''
    
    // 3 letras iniciais
    for (let i = 0; i < 3; i++) {
      username += letters.charAt(Math.floor(Math.random() * letters.length))
    }
    
    // Completar com 6 números para totalizar 9 caracteres
    for (let i = 0; i < 6; i++) {
      username += numbers.charAt(Math.floor(Math.random() * numbers.length))
    }
    
    return username
  }

  const generateRandomPassword = () => {
    // Gera senha: apenas letras e números, mínimo 9 caracteres
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = Math.floor(Math.random() * 4) + 9 // 9 a 12 caracteres
    
    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return password
  }

  const handleRegenerateUsername = () => {
    setFormData({
      ...formData,
      username: generateRandomUsername()
    })
  }

  const handleRegeneratePassword = () => {
    setFormData({
      ...formData,
      password: generateRandomPassword()
    })
  }

  const handleCreateClient = async () => {
    if (!hasServers) {
      addNotification({
        type: 'warning',
        message: 'Você precisa adicionar um servidor antes de criar clientes'
      })
      setTimeout(() => {
        window.location.href = '/servers'
      }, 1500)
      return
    }
    
    // Carrega servidores e planos
    const { data: serversList } = await api.get('/servers')
    setServers(serversList || [])
    
    const { data: plansList } = await api.get('/plans')
    setPlans(plansList || [])
    
    // Seleciona o primeiro servidor e plano automaticamente
    const firstServer = serversList && serversList.length > 0 ? serversList[0] : null
    const firstPlan = plansList && plansList.length > 0 ? plansList[0] : null
    
    // Se tem servidor, carrega os bouquets ANTES de mostrar o formulário
    if (firstServer) {
      await loadServerBouquets(firstServer.id, serversList)
      const serverPlans = plansList.filter(plan => plan.server_id === firstServer.id && plan.status === 'active')
      setAvailablePlans(serverPlans)
    }
    
    // Gera username e senha aleatórios e preenche servidor/plano
    const newFormData = {
      ...formData,
      username: generateRandomUsername(),
      password: generateRandomPassword(),
      server_id: firstServer ? firstServer.id : '',
      plan: firstPlan ? firstPlan.id : ''
    }
    
    setFormData(newFormData)
    
    // Muda para view de formulário DEPOIS de carregar tudo
    setView('form')
  }

  const handleRegenerateCredentials = () => {
    setFormData({
      ...formData,
      username: generateRandomUsername(),
      password: generateRandomPassword()
    })
  }

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // VIEW: Formulário de Adicionar Cliente
  if (view === 'form') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Adicionar Cliente</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Preencha os dados do novo cliente
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Detalhes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-3">
              Detalhes
            </h3>

            {/* Servidor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Servidor *
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.server_id}
                  onChange={(e) => handleServerChange(e.target.value)}
                  className={`w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all appearance-none cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 ${
                    formData.server_id 
                      ? 'text-gray-600 dark:text-gray-300' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <option value="" disabled hidden>Selecione um servidor</option>
                  {servers.map((server) => (
                    <option key={server.id} value={server.id} className="text-gray-600 dark:text-gray-300">
                      {server.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Plano */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plano *
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  disabled={!formData.server_id || availablePlans.length === 0}
                  className={`w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all appearance-none cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-slate-600 ${
                    formData.plan 
                      ? 'text-gray-600 dark:text-gray-300' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <option value="" disabled hidden>Selecione um plano</option>
                  {availablePlans.map((plan) => (
                    <option key={plan.id} value={plan.id} className="text-gray-600 dark:text-gray-300">
                      {plan.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {formData.server_id && availablePlans.length === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mt-2">
                  <p className="text-xs text-yellow-800 dark:text-yellow-300">
                    ⚠️ Você precisa criar um plano primeiro. Acesse o menu <strong>Sistema → Planos</strong> para criar ou{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/plans')}
                      className="underline font-semibold hover:text-yellow-900 dark:hover:text-yellow-200 transition-colors"
                    >
                      clique aqui
                    </button>
                    .
                  </p>
                </div>
              )}
            </div>

            {/* Conexões */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conexões *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, connections: Math.max(1, formData.connections - 1) })}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.connections}
                  onChange={(e) => setFormData({ ...formData, connections: parseInt(e.target.value) || 1 })}
                  className="w-20 h-10 px-4 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-center focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, connections: formData.connections + 1 })}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
                >
                  +
                </button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Você tem créditos ilimitados
                </p>
              </div>
            </div>

            {/* Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usuário *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  minLength={6}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="usuario123"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleRegenerateUsername}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Gerar novo usuário"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2 space-y-1">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  • O campo usuário só pode conter letras, números e traços
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  • O nome de usuário deve ter pelo menos 3 letras no início, entre 9 e 20 caracteres. Somente letras e números são permitidos. Sem acentos
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  • O usuário precisa ter no mínimo 6 caracteres
                </p>
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="senha123"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleRegeneratePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Gerar nova senha"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2 space-y-1">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  • A senha só pode ter letras, números, traços e underline
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  • A senha deve conter apenas letras e números e ter no mínimo 9 caracteres
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  • A senha precisa ter no mínimo 8 caracteres
                </p>
              </div>
            </div>

            {/* Vencimento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vencimento (Opcional)
              </label>
              <DateTimePicker
                value={formData.expiry_date}
                onChange={(value) => setFormData({ ...formData, expiry_date: value })}
                placeholder="Selecione uma data (opcional)"
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Deixe em branco para calcular a data inicial com base na duração do plano
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 mt-2">
                <p className="text-xs text-green-800 dark:text-green-300">
                  Você não será cobrado nenhum crédito para alterar a data de vencimento
                </p>
              </div>
            </div>

            {/* Valor do Plano */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor do Plano
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300 text-sm pointer-events-none">
                  R$
                </span>
                <input
                  type="text"
                  value={formData.plan_price}
                  onChange={(e) => {
                    // Remove tudo que não é número
                    let value = e.target.value.replace(/\D/g, '')
                    
                    if (value === '') {
                      setFormData({ ...formData, plan_price: '' })
                      return
                    }
                    
                    // Converte para centavos e formata
                    const numValue = parseInt(value)
                    const formatted = (numValue / 100).toFixed(2)
                    setFormData({ ...formData, plan_price: formatted })
                  }}
                  placeholder="Opcional, deixe em branco se não houver valor"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  O cliente pagará R$ {formData.plan_price || '0,00'} por {formData.connections} conexão(ões)
                </p>
              </div>
            </div>

            {/* Bouquets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bouquets
              </label>
              
              {formData.bouquets && formData.bouquets.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md border border-gray-200 dark:border-slate-600">
                  {formData.bouquets.map((bouquetId) => {
                    const bouquet = bouquets.find(b => b.id === bouquetId)
                    return (
                      <span
                        key={bouquetId}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {bouquet ? (bouquet.bouquet_name || bouquet.name || `Bouquet ${bouquetId}`) : bouquetId}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              bouquets: formData.bouquets.filter(id => id !== bouquetId)
                            })
                          }}
                          className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                        >
                          <XCircle size={14} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}

              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const selectedId = e.target.value
                    if (selectedId && !formData.bouquets?.includes(selectedId)) {
                      setFormData({
                        ...formData,
                        bouquets: [...(formData.bouquets || []), selectedId]
                      })
                    }
                  }}
                  disabled={!formData.server_id}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-400 dark:text-gray-500 focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all appearance-none cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-slate-600"
                >
                  <option value="" disabled hidden>Opcional, deixe em branco para usar o Padrão do Plano</option>
                  {bouquets.length === 0 ? (
                    <option value="" disabled>Carregando bouquets...</option>
                  ) : (
                    bouquets
                      .filter(bouquet => !formData.bouquets?.includes(bouquet.id))
                      .map((bouquet) => (
                        <option key={bouquet.id} value={bouquet.id} className="text-gray-600 dark:text-gray-300">
                          {bouquet.bouquet_name || bouquet.name || `Bouquet ${bouquet.id}`}
                        </option>
                      ))
                  )}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-3">
                Dados Pessoais
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Apenas você pode visualizar os dados pessoais deste cliente
              </p>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo do cliente"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
              />
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
              />
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telegram
              </label>
              <input
                type="text"
                value={formData.telegram}
                onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                placeholder="@usuario"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WhatsApp
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="55 11 99999 3333"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Incluindo o código do país - com ou sem espaço e traços - ex. 55 11 99999 3333
                </p>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações sobre o cliente..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Criar Cliente
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CLIENTES</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gerencie todos os clientes do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              <Download size={18} />
              Exportar
            </button>
            <button 
              onClick={handleCreateClient}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Criar Cliente
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pesquisar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por login, nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mostrar
            </label>
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
            >
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
            >
              <option value="all">Todos</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="expired">Expirados</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Filter size={18} />
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Login
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Senha
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Adicionado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Máximo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Conexões
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Notas
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      #{client.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {client.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {client.password || '••••••••'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(client.expiry_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {client.max_connections || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {client.active_connections || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {client.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="Copiar link"
                        >
                          <LinkIcon size={18} />
                        </button>
                        <button
                          className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title="Renovar"
                        >
                          <RefreshCw size={18} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                        <Search size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Nenhum cliente encontrado
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Tente ajustar os filtros ou criar um novo cliente
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {clients.length > 0 && (
          <div className="bg-gray-50 dark:bg-slate-700/30 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {((currentPage - 1) * perPage) + 1} até {Math.min(currentPage * perPage, totalRecords)} de {totalRecords} registros
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Primeira
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
                  {(() => {
                    const maxButtons = 5
                    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
                    let endPage = Math.min(totalPages, startPage + maxButtons - 1)
                    
                    if (endPage - startPage < maxButtons - 1) {
                      startPage = Math.max(1, endPage - maxButtons + 1)
                    }
                    
                    const pages = []
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === i
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {i}
                        </button>
                      )
                    }
                    return pages
                  })()}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Seguinte
                </button>
                
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Última
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
