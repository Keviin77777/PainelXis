import { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Copy, ArrowLeft, Package, XCircle } from 'lucide-react'
import { useNotificationStore } from '../store/notificationStore'
import api from '../services/api'

export default function Plans() {
  const { addNotification } = useNotificationStore()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [view, setView] = useState('list') // 'list', 'form'
  const [servers, setServers] = useState([])
  const [bouquets, setBouquets] = useState([])
  const [loadingBouquets, setLoadingBouquets] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, planId: null, planName: '' })
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    server_id: '',
    duration_value: 1,
    duration_unit: 'months',
    template_header: '',
    template_footer: '',
    status: 'active',
    test_mode: false,
    show_in_dashboard: false,
    price: '',
    credits: 1,
    order: 0,
    bouquets: []
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/plans')
      setPlans(data || [])
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadServers = async () => {
    try {
      const { data } = await api.get('/servers')
      setServers(data || [])
    } catch (error) {
      console.error('Erro ao carregar servidores:', error)
    }
  }

  const loadServerBouquets = async (serverId, serversList = null) => {
    try {
      setLoadingBouquets(true)
      
      // Usa a lista de servidores passada ou a do estado
      const serversToUse = serversList || servers
      const server = serversToUse.find(s => s.id === parseInt(serverId))
      
      if (!server) {
        setBouquets([])
        setLoadingBouquets(false)
        return
      }

      const { data } = await api.get(`/servers/${serverId}/bouquets`)
      
      if (data.success && data.data) {
        if (server.allowed_bouquets && server.allowed_bouquets.length > 0) {
          const filteredBouquets = data.data.filter(bouquet => 
            server.allowed_bouquets.includes(bouquet.id)
          )
          setBouquets(filteredBouquets)
        } else {
          setBouquets(data.data)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar bouquets:', error)
      setBouquets([])
    } finally {
      setLoadingBouquets(false)
    }
  }

  const handleServerChange = (serverId) => {
    setFormData({ ...formData, server_id: serverId, bouquets: [] })
    if (serverId) {
      loadServerBouquets(serverId)
    } else {
      setBouquets([])
      setLoadingBouquets(false)
    }
  }

  const handleCreatePlan = async () => {
    await loadServers()
    setView('form')
  }

  const handleCancel = () => {
    setView('list')
    setBouquets([])
    setLoadingBouquets(false)
    setFormData({
      name: '',
      server_id: '',
      duration_value: 1,
      duration_unit: 'months',
      template_header: '',
      template_footer: '',
      status: 'active',
      test_mode: false,
      show_in_dashboard: false,
      price: '',
      credits: 1,
      order: 0,
      bouquets: []
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (formData.id) {
        // Editar plano existente
        await api.put(`/plans/${formData.id}`, formData)
        addNotification({
          type: 'success',
          message: 'Plano atualizado com sucesso'
        })
      } else {
        // Criar novo plano
        await api.post('/plans', formData)
        addNotification({
          type: 'success',
          message: 'Plano criado com sucesso'
        })
      }
      handleCancel()
      loadPlans()
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao salvar plano'
      })
    }
  }

  const handleEdit = async (plan) => {
    // Primeiro definir o formData
    setFormData({
      id: plan.id,
      name: plan.name,
      server_id: plan.server_id,
      duration_value: plan.duration_value,
      duration_unit: plan.duration_unit,
      template_header: plan.template_header || '',
      template_footer: plan.template_footer || '',
      status: plan.status,
      test_mode: plan.test_mode,
      show_in_dashboard: plan.show_in_dashboard,
      price: plan.price || '',
      credits: plan.credits,
      order: plan.order,
      bouquets: plan.bouquets || []
    })
    
    // Carregar servidores e obter a lista atualizada
    const { data: serversList } = await api.get('/servers')
    setServers(serversList || [])
    
    // Mudar para view de formulário
    setView('form')
    
    // Carregar bouquets passando a lista de servidores carregada
    if (plan.server_id) {
      await loadServerBouquets(plan.server_id, serversList)
    }
  }

  const handleCopy = async (plan) => {
    // Primeiro definir o formData
    setFormData({
      name: plan.name + ' (Cópia)',
      server_id: plan.server_id,
      duration_value: plan.duration_value,
      duration_unit: plan.duration_unit,
      template_header: plan.template_header || '',
      template_footer: plan.template_footer || '',
      status: plan.status,
      test_mode: plan.test_mode,
      show_in_dashboard: plan.show_in_dashboard,
      price: plan.price || '',
      credits: plan.credits,
      order: plan.order,
      bouquets: plan.bouquets || []
    })
    
    // Carregar servidores e obter a lista atualizada
    const { data: serversList } = await api.get('/servers')
    setServers(serversList || [])
    
    // Mudar para view de formulário
    setView('form')
    
    // Carregar bouquets passando a lista de servidores carregada
    if (plan.server_id) {
      await loadServerBouquets(plan.server_id, serversList)
    }
  }

  const openDeleteModal = (plan) => {
    setDeleteModal({ isOpen: true, planId: plan.id, planName: plan.name })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, planId: null, planName: '' })
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/plans/${deleteModal.planId}`)
      addNotification({
        type: 'success',
        message: 'Plano excluído com sucesso'
      })
      closeDeleteModal()
      loadPlans()
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao excluir plano'
      })
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Ativo', class: 'bg-green-500 text-white dark:bg-green-600' },
      inactive: { label: 'Inativo', class: 'bg-red-500 text-white dark:bg-red-600' }
    }
    const badge = badges[status] || badges.inactive
    return (
      <span className={`px-3 py-1 rounded text-xs font-semibold ${badge.class}`}>
        {badge.label}
      </span>
    )
  }

  const getTestBadge = (isTest) => {
    if (!isTest) return null
    return (
      <span className="px-3 py-1 rounded text-xs font-semibold bg-yellow-500 text-white dark:bg-yellow-600">
        Teste
      </span>
    )
  }

  if (loading && plans.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // VIEW: Formulário
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
              <Package size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formData.id ? 'Editar Plano' : 'Adicionar Plano'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formData.id ? 'Atualize os dados do plano' : 'Preencha os dados do novo plano'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
            
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Obrigatório"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
              />
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mt-2">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  O nome do plano ficará visível para clientes e revendas.
                </p>
              </div>
            </div>

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
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all appearance-none cursor-pointer hover:border-blue-400 dark:hover:border-blue-600"
                >
                  <option value="">Selecione um servidor</option>
                  {servers.map((server) => (
                    <option key={server.id} value={server.id}>
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
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mt-2">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  O servidor não pode ser alterado após salvar.
                </p>
              </div>
            </div>

            {/* Bouquets - Aparece apenas quando servidor é selecionado */}
            {formData.server_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bouquets
                </label>
                
                {loadingBouquets ? (
                  <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-700/50 rounded-md border border-gray-200 dark:border-slate-600">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Carregando bouquets do servidor...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {formData.bouquets && formData.bouquets.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md border border-gray-200 dark:border-slate-600">
                        {formData.bouquets.map((bouquetId) => {
                          // Comparar tanto string quanto número
                          const bouquet = bouquets.find(b => String(b.id) === String(bouquetId))
                          return (
                            <span
                              key={bouquetId}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                            >
                              {bouquet ? (bouquet.bouquet_name || bouquet.name || `Bouquet ${bouquetId}`) : `Bouquet ${bouquetId}`}
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
                          // Verificar se já não está incluído (comparando como string)
                          const alreadyIncluded = formData.bouquets?.some(id => String(id) === String(selectedId))
                          if (selectedId && !alreadyIncluded) {
                            setFormData({
                              ...formData,
                              bouquets: [...(formData.bouquets || []), selectedId]
                            })
                          }
                        }}
                        disabled={bouquets.length === 0}
                        className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all appearance-none cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-slate-600"
                      >
                        <option value="">
                          {bouquets.length === 0 ? 'Nenhum bouquet disponível' : 'Clique aqui para selecionar bouquets'}
                        </option>
                        {bouquets
                          .filter(bouquet => !formData.bouquets?.some(id => String(id) === String(bouquet.id)))
                          .map((bouquet) => (
                            <option key={bouquet.id} value={bouquet.id}>
                              {bouquet.bouquet_name || bouquet.name || `Bouquet ${bouquet.id}`}
                            </option>
                          ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Duração */}
            <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/30 dark:bg-blue-900/10">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duração *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.duration_value}
                  onChange={(e) => setFormData({ ...formData, duration_value: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
                />
                <div className="relative">
                  <select
                    value={formData.duration_unit}
                    onChange={(e) => setFormData({ ...formData, duration_unit: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 appearance-none cursor-pointer"
                  >
                    <option value="hours">Horas</option>
                    <option value="days">Dias</option>
                    <option value="months">Meses</option>
                    <option value="years">Anos</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mt-2">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  Esta data será renovada por {formData.duration_value} {formData.duration_unit === 'hours' ? 'hora(s)' : formData.duration_unit === 'days' ? 'dia(s)' : formData.duration_unit === 'months' ? 'mês(es)' : 'ano(s)'}.
                </p>
              </div>
            </div>

            {/* Ordem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordem
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Números menores aparecem no topo. Você pode usar números negativos.
                </p>
              </div>
            </div>

            {/* Situação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Situação *
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ativo</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Inativo</span>
                </label>
              </div>
            </div>

            {/* Teste */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teste *
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="test_mode"
                    value="false"
                    checked={!formData.test_mode}
                    onChange={() => setFormData({ ...formData, test_mode: false, show_in_dashboard: false })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Não</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="test_mode"
                    value="true"
                    checked={formData.test_mode}
                    onChange={() => setFormData({ ...formData, test_mode: true })}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Sim</span>
                </label>
              </div>
            </div>

            {/* Mostrar na Dashboard - Aparece apenas quando Teste = Sim */}
            {formData.test_mode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mostrar na página de Teste Rápido da Dashboard? *
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="show_in_dashboard"
                      value="false"
                      checked={!formData.show_in_dashboard}
                      onChange={() => setFormData({ ...formData, show_in_dashboard: false })}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Não</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="show_in_dashboard"
                      value="true"
                      checked={formData.show_in_dashboard}
                      onChange={() => setFormData({ ...formData, show_in_dashboard: true })}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Sim</span>
                  </label>
                </div>
              </div>
            )}

            {/* Valor do Plano e Créditos */}
            <div className="border-2 border-dashed border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/30 dark:bg-green-900/10">
              <div className="grid grid-cols-2 gap-4">
                {/* Valor do Plano */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor do Plano
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                      R$
                    </span>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '')
                        if (value === '') {
                          setFormData({ ...formData, price: '' })
                          return
                        }
                        value = (parseInt(value) / 100).toFixed(2)
                        setFormData({ ...formData, price: value })
                      }}
                      placeholder="0 é permitido"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Créditos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Créditos *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Templates */}
            <div className="border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50/30 dark:bg-purple-900/10">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Templates (Opcional)
              </label>
              <textarea
                value={formData.template_header}
                onChange={(e) => setFormData({ ...formData, template_header: e.target.value })}
                placeholder="Cabeçalho do template"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 mb-3"
              />
              <textarea
                value={formData.template_footer}
                onChange={(e) => setFormData({ ...formData, template_footer: e.target.value })}
                placeholder="Rodapé do template"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
            >
              {formData.id ? 'Atualizar Plano' : 'Salvar Plano'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // VIEW: Lista de Planos
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PLANOS</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gerencie todos os planos do sistema
            </p>
          </div>
          
          <button 
            onClick={handleCreatePlan}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </div>

        {/* Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar planos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-400 dark:focus:border-blue-600"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Servidor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Plano
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Situação
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Teste
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Valor do Plano
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Créditos
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Ordem
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {plans.length > 0 ? (
                plans
                  .filter(plan => 
                    plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    plan.server_name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {plan.server_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {plan.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(plan.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTestBadge(plan.test_mode)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {plan.price || 'R$ 0,00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {plan.credits || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {plan.duration_value} {plan.duration_unit === 'hours' ? 'hora(s)' : plan.duration_unit === 'days' ? 'dia(s)' : plan.duration_unit === 'months' ? 'mês(es)' : 'ano(s)'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {plan.order || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCopy(plan)}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                            title="Copiar"
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(plan)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(plan)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
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
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                        <Package size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Nenhum plano encontrado
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Clique em "Adicionar" para criar seu primeiro plano
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Excluir Plano</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Esta ação não pode ser desfeita</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Tem certeza que deseja excluir o plano <span className="font-semibold text-gray-900 dark:text-white">"{deleteModal.planName}"</span>?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 font-bold">⚠️</span>
                  <span>Esta ação é <strong>irreversível</strong>. O plano será permanentemente removido do sistema.</span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-b-xl flex items-center justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Excluir Plano
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
