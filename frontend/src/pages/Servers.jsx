import { useState, useEffect } from 'react'
import { Plus, Server, Edit, Trash2, CheckCircle, XCircle, ArrowLeft, Eye, EyeOff, Globe, Users, FileText } from 'lucide-react'
import { useNotificationStore } from '../store/notificationStore'
import api from '../services/api'

export default function Servers() {
  const { addNotification } = useNotificationStore()
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list') // 'list', 'select-type', 'form'
  const [selectedServer, setSelectedServer] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [groups, setGroups] = useState([])
  const [bouquets, setBouquets] = useState([])
  const [loadingGroups, setLoadingGroups] = useState(false)
  const [loadingBouquets, setLoadingBouquets] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, serverId: null, serverName: '' })
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    url: '',
    api_key: '',
    api_version: '1',
    use_proxy: false,
    status: 'active'
  })

  useEffect(() => {
    loadServers()
  }, [])

  const loadServers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/servers')
      setServers(data || [])
    } catch (error) {
      console.error('Erro ao carregar servidores:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedServer(null)
    setFormData({
      name: '',
      type: '',
      url: '',
      api_key: '',
      api_version: '1',
      use_proxy: false,
      status: 'active'
    })
    setView('select-type')
  }

  const handleEdit = (server) => {
    setSelectedServer(server)
    setFormData(server)
    setView('form')
    // Carrega grupos e bouquets quando editar um servidor existente
    if (server.id) {
      loadGroups(server.id)
      loadBouquets(server.id)
    }
  }

  const handleSelectType = (type) => {
    setFormData({ ...formData, type })
    setView('form')
  }

  const handleCancel = () => {
    setView('list')
    setSelectedServer(null)
    setShowPassword(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      let savedServer
      if (selectedServer) {
        const { data } = await api.put(`/servers/${selectedServer.id}`, formData)
        savedServer = data.data
        addNotification({
          type: 'success',
          message: 'Servidor atualizado com sucesso'
        })
      } else {
        const { data } = await api.post('/servers', formData)
        savedServer = data.data
        addNotification({
          type: 'success',
          message: 'Servidor adicionado com sucesso'
        })
        // Após salvar, carrega grupos e bouquets
        setSelectedServer(savedServer)
        loadGroups(savedServer.id)
        loadBouquets(savedServer.id)
      }
      
      loadServers()
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao salvar servidor'
      })
    }
  }

  const openDeleteModal = (server) => {
    setDeleteModal({ isOpen: true, serverId: server.id, serverName: server.name })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, serverId: null, serverName: '' })
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/servers/${deleteModal.serverId}`)
      addNotification({
        type: 'success',
        message: 'Servidor excluído com sucesso'
      })
      closeDeleteModal()
      loadServers()
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erro ao excluir servidor'
      })
    }
  }

  const testConnection = async () => {
    try {
      const { data } = await api.post('/servers/test', formData)
      addNotification({
        type: 'success',
        message: 'Conexão testada com sucesso!'
      })
      
      // Após teste bem-sucedido, carrega grupos e bouquets diretamente
      if (data.success) {
        await loadGroupsFromCredentials()
        await loadBouquetsFromCredentials()
      }
      
      return data.success
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Falha ao testar conexão'
      })
      return false
    }
  }

  const loadGroupsFromCredentials = async () => {
    try {
      setLoadingGroups(true)
      const response = await api.post('/servers/test-groups', {
        url: formData.url,
        api_key: formData.api_key
      })
      if (response.data.success && response.data.data) {
        // Filtra grupos removendo ADMINISTRADORES (is_admin === "1")
        const filteredGroups = response.data.data.filter(group => group.is_admin !== "1")
        setGroups(filteredGroups)
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
    } finally {
      setLoadingGroups(false)
    }
  }

  const loadBouquetsFromCredentials = async () => {
    try {
      setLoadingBouquets(true)
      const response = await api.post('/servers/test-bouquets', {
        url: formData.url,
        api_key: formData.api_key
      })
      if (response.data.success && response.data.data) {
        setBouquets(response.data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar bouquets:', error)
    } finally {
      setLoadingBouquets(false)
    }
  }

  const loadGroups = async (serverId) => {
    try {
      setLoadingGroups(true)
      const { data } = await api.get(`/servers/${serverId}/groups`)
      if (data.success && data.data) {
        // Filtra grupos removendo ADMINISTRADORES (is_admin === "1")
        const filteredGroups = data.data.filter(group => group.is_admin !== "1")
        setGroups(filteredGroups)
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
      addNotification({
        type: 'error',
        message: 'Erro ao carregar grupos de revendedores'
      })
    } finally {
      setLoadingGroups(false)
    }
  }

  const loadBouquets = async (serverId) => {
    try {
      setLoadingBouquets(true)
      const { data } = await api.get(`/servers/${serverId}/bouquets`)
      if (data.success && data.data) {
        setBouquets(data.data)
      }
    } catch (error) {
      console.error('Erro ao carregar bouquets:', error)
      addNotification({
        type: 'error',
        message: 'Erro ao carregar bouquets'
      })
    } finally {
      setLoadingBouquets(false)
    }
  }

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-semibold flex items-center gap-1">
        <CheckCircle size={14} />
        Ativo
      </span>
    ) : (
      <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-semibold flex items-center gap-1">
        <XCircle size={14} />
        Inativo
      </span>
    )
  }

  const getTypeBadge = (type) => {
    const badges = {
      XUIONE: { label: 'IPTV', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' }
    }
    const badge = badges[type] || badges.XUIONE
    
    return (
      <span className={`px-3 py-1 rounded text-xs font-semibold ${badge.class}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // VIEW: Seleção de Tipo
  if (view === 'select-type') {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
              <Server size={24} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Selecione o Tipo de Servidor</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Escolha o tipo de servidor que deseja adicionar
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* XUIONE */}
          <button
            onClick={() => handleSelectType('XUIONE')}
            className="group bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500 p-6 shadow-sm hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Server size={32} className="text-white" />
              </div>
              <CheckCircle size={24} className="text-blue-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              XUIONE
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Sistema completo de gerenciamento IPTV com suporte a múltiplos protocolos
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <span>Disponível</span>
              <span>→</span>
            </div>
          </button>

          {/* 1-Stream */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 p-6 shadow-sm opacity-60 cursor-not-allowed">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <Server size={32} className="text-gray-400" />
              </div>
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full text-xs font-semibold">
                Em breve
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">
              1-Stream
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Plataforma de streaming com recursos avançados
            </p>
          </div>

          {/* Xtream UI */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 p-6 shadow-sm opacity-60 cursor-not-allowed">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <Server size={32} className="text-gray-400" />
              </div>
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full text-xs font-semibold">
                Em breve
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">
              Xtream UI / StreamCreed
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Compatível com Xtream Codes e StreamCreed
            </p>
          </div>

          {/* Binstream */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 p-6 shadow-sm opacity-60 cursor-not-allowed">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                <Server size={32} className="text-gray-400" />
              </div>
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full text-xs font-semibold">
                Em breve
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">
              Binstream
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Sistema de streaming binário de alta performance
            </p>
          </div>
        </div>
      </div>
    )
  }

  // VIEW: Formulário
  if (view === 'form') {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <button
            onClick={() => selectedServer ? handleCancel() : setView('select-type')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
              <Server size={24} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {selectedServer ? 'Editar Servidor' : 'Adicionar Servidor'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedServer ? 'Atualize as informações do servidor' : 'Preencha os dados do novo servidor'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configurações de Conexão */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 pb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Globe size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Configurações de Conexão
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  URLs, DNS e configurações de rede
                </p>
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL *
              </label>
              <input
                type="text"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="http://exemplo.com/CodigoAcesso"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-2">
                  <strong>Formato:</strong> http://IP_ou_Domínio/Código_de_Acesso
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <strong>Exemplos:</strong><br/>
                  • http://192.168.1.100/ABC123<br/>
                  • http://meuservidor.com:8080/XYZ789<br/>
                  • https://painel.exemplo.com/MeuCodigo
                </p>
              </div>
            </div>

            {/* Chave da API */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chave da API (Token) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder="Seu token de API"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Token encontrado no seu perfil do XUI. Será usado para autenticar as requisições à API.
                </p>
              </div>

            </div>

            {/* Versão da API */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Versão da API *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.api_version}
                onChange={(e) => setFormData({ ...formData, api_version: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  ⚠️ Se estiver enfrentando problemas com a sincronização dos clientes, tente alterar a versão da API para a versão 2.
                </p>
              </div>
            </div>

            {/* Testar Conexão */}
            <div>
              <button
                type="button"
                onClick={testConnection}
                className="w-full px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Testar Conexão
              </button>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Clique para verificar se a conexão com o servidor está funcionando corretamente.
                </p>
              </div>
            </div>

            {/* Ação quando salvar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ação quando salvar esse servidor
              </label>
              <select
                value={formData.save_action || 'nothing'}
                onChange={(e) => setFormData({ ...formData, save_action: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="nothing">Não fazer nada</option>
                <option value="add_all">Adicionar a todos os revendas</option>
                <option value="remove_all">Remover de todos os revendas</option>
              </select>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Se permitir que seus revendas acessem todos os servidores, deixe como 'Não fazer nada' acima.
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-red-800 dark:text-red-300">
                  Lembre-se de que, se você optar por remover este servidor de todos os revendas, apenas os revendas sem um cliente ativo terão o servidor removido. Os revendas que tiverem clientes ativos precisam apagar os clientes antes que você possa remover.
                </p>
              </div>
            </div>

          {/* DNS Principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              DNS Principal
            </label>
            <input
              type="text"
              value={formData.primary_dns || ''}
              onChange={(e) => setFormData({ ...formData, primary_dns: e.target.value })}
              placeholder="http://meuservidor.xyz:80"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Usado em modelos e Player API, por exemplo, http://meuservidor.xyz:80
              </p>
            </div>
          </div>

          {/* DNS Aleatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              DNS Aleatório (opcional)
            </label>
            <textarea
              value={formData.random_dns || ''}
              onChange={(e) => setFormData({ ...formData, random_dns: e.target.value })}
              placeholder="http://dns1.exemplo.com:80&#10;http://dns2.exemplo.com:80&#10;http://dns3.exemplo.com:80"
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Usado em templates. Digite ou cole um DNS por linha incluindo http e porta se necessário. Deixe em branco para usar o DNS Principal acima.
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-2">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                Cada vez que uma playlist for gerada ou a M3U copiada, o painel irá escolher um DNS da lista abaixo aleatoriamente. O revenda não terá a opção de escolher um DNS, será o painel que irá escolher um DNS aleatório.
              </p>
            </div>
          </div>
          </div>

          {/* Configurações Básicas */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 pb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Server size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Configurações Básicas
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Informações principais do servidor
                </p>
              </div>
            </div>

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
                placeholder="Ex: Servidor Principal"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* ID do Grupo de Revenda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID do Grupo de Revenda
              </label>
              <select
                value={formData.reseller_group_id || ''}
                onChange={(e) => setFormData({ ...formData, reseller_group_id: e.target.value })}
                disabled={loadingGroups || groups.length === 0}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingGroups ? 'Carregando grupos...' : groups.length === 0 ? 'Teste a conexão primeiro' : 'Selecione um grupo'}
                </option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.group_name || group.name || `Grupo ${group.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordem
              </label>
              <input
                type="number"
                value={formData.order || 0}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  A ordem é por número, um número menor irá fazer com que seja mostrado no topo. Você pode digitar números negativos ex. -999.
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Situação
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.status === 'active'}
                    onChange={() => setFormData({ ...formData, status: 'active' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.status === 'inactive'}
                    onChange={() => setFormData({ ...formData, status: 'inactive' })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Inativo</span>
                </label>
              </div>
            </div>

            {/* Fuso Horário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fuso Horário
              </label>
              <input
                type="text"
                value={formData.timezone || ''}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                placeholder="Ex: America/Sao_Paulo"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Se deixado em branco, o fuso horário do painel será utilizado. Esse fuso horário será usado ao enviar datas para o servidor.
                </p>
              </div>
            </div>
          </div>

          {/* Configurações de Clientes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 pb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Configurações de Clientes
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Limites e configurações padrão
                </p>
              </div>
            </div>

            {/* Senha Padrão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha Padrão de Cliente
              </label>
              <input
                type="text"
                value={formData.default_password || ''}
                onChange={(e) => setFormData({ ...formData, default_password: e.target.value })}
                placeholder="Apps/P2 Americano"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Se você configurar uma senha aqui, qualquer novo cliente criado terá essa senha.
                </p>
              </div>
            </div>

            {/* Bouquets Permitidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bouquets Permitidos
              </label>
              
              {/* Tags selecionadas */}
              {formData.allowed_bouquets && formData.allowed_bouquets.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                  {formData.allowed_bouquets.map((bouquetId) => {
                    const bouquet = bouquets.find(b => b.id === bouquetId)
                    return (
                      <span
                        key={bouquetId}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {bouquet ? (bouquet.bouquet_name || bouquet.name || `Bouquet ${bouquetId}`) : bouquetId}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              allowed_bouquets: formData.allowed_bouquets.filter(id => id !== bouquetId)
                            })
                          }}
                          className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                        >
                          <XCircle size={14} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}

              {/* Dropdown de seleção */}
              <select
                value=""
                onChange={(e) => {
                  const selectedId = e.target.value
                  if (selectedId && !formData.allowed_bouquets?.includes(selectedId)) {
                    setFormData({
                      ...formData,
                      allowed_bouquets: [...(formData.allowed_bouquets || []), selectedId]
                    })
                  }
                }}
                disabled={loadingBouquets || bouquets.length === 0}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingBouquets ? 'Carregando bouquets...' : bouquets.length === 0 ? 'Teste a conexão primeiro' : 'Selecione um bouquet'}
                </option>
                {bouquets
                  .filter(bouquet => !formData.allowed_bouquets?.includes(bouquet.id))
                  .map((bouquet) => (
                    <option key={bouquet.id} value={bouquet.id}>
                      {bouquet.bouquet_name || bouquet.name || `Bouquet ${bouquet.id}`}
                    </option>
                  ))}
              </select>
            </div>

            {/* Máximo de Conexões */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número máximo de conexões que um cliente pode ter
              </label>
              <input
                type="number"
                min="0"
                value={formData.max_connections || 0}
                onChange={(e) => setFormData({ ...formData, max_connections: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Digite 0 para usar o padrão do painel.
                </p>
              </div>
            </div>

            {/* Máximo de Clientes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número máximo de clientes que pode ser criado neste servidor
              </label>
              <input
                type="number"
                min="0"
                value={formData.max_clients || 0}
                onChange={(e) => setFormData({ ...formData, max_clients: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Digite 0 para clientes ilimitados.
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  O número de clientes é o número de clientes ativos multiplicado pelo número de conexões.
                </p>
              </div>
            </div>
          </div>

          {/* Template */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200 dark:border-slate-700 pb-4">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Template de Mensagem
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Personalize a mensagem enviada aos clientes
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template
              </label>
              <textarea
                value={formData.template || ''}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                placeholder="Cole o template aqui..."
                rows={12}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-2 font-semibold">
                  Você pode copiar o exemplo abaixo e colar na caixa acima:
                </p>
                <pre className="text-xs text-blue-700 dark:text-blue-400 whitespace-pre-wrap font-mono">
{`✅ *Usuário:* {username}
✅ *Senha:* {password}
📦 *Plano:* {package}
💳 *Assinar/Renovar Plano:* {pay_url}
💵 *Valor do Plano:* {plan_price}
🗓️ *Criado em:* {created_at}
🗓️ *Vencimento:* {expires_at}
📶 *Conexões:* {connections}
🟠 *DNS XCIPTV:* {dns}
🟠 *DNS SMARTERS:* {dns}
🟢 *Link (M3U):* {dns}/get.php?username={username}&password={password}&type=m3u_plus&output=mpegts
🟢 *Link Curto (M3U):* http://e.{dns_host}/p/{username}/{password}/m3u
🟡 *Link (HLS):* {dns}/get.php?username={username}&password={password}&type=m3u_plus&output=hls
🟡 *Link Curto (HLS):* http://e.{dns_host}/p/{username}/{password}/hls
🔴 *Link (SSIPTV):* http://e.{dns_host}/p/{username}/{password}/ssiptv
📺 *DNS STB / SmartUp:* XXXXX
📺 *WebPlayer:* http://XXXXXX/

✅ *PARA ANDROID:*
- PLAYSTORE
- EM BREVE

✅ *App EM APK (LINK DIRETO):*
*DOWNLOAD:* https://bit.ly/XXXXX`}
                </pre>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
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
              {selectedServer ? 'Atualizar Servidor' : 'Salvar Servidor'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // VIEW: Lista de Servidores
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
              <Server size={24} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Servidores</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gerencie os servidores conectados ao sistema
              </p>
            </div>
          </div>
          
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Adicionar
          </button>
        </div>
      </div>

      {/* Tabela de Servidores */}
      {servers.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Servidor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Situação
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Tipo de Conexão
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Clientes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {servers.map((server) => (
                  <tr key={server.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Server size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {server.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {server.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(server.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs font-semibold">
                        {server.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getTypeBadge(server.type)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {server.clients_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(server)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => openDeleteModal(server)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12 shadow-sm">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <Server size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">
              Nenhum servidor cadastrado
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Adicione seu primeiro servidor para começar
            </p>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Adicionar Servidor
            </button>
          </div>
        </div>
      )}

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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Excluir Servidor</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Esta ação não pode ser desfeita</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Tem certeza que deseja excluir o servidor <span className="font-semibold text-gray-900 dark:text-white">"{deleteModal.serverName}"</span>?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 font-bold">⚠️</span>
                  <span>Esta ação é <strong>irreversível</strong>. Todos os planos e clientes associados a este servidor serão afetados.</span>
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
                Excluir Servidor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
