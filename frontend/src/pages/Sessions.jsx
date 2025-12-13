import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Tablet, MapPin, Clock, Chrome, Globe, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
import { useNotificationStore } from '../store/notificationStore'
import api from '../services/api'

export default function Sessions() {
  const { addNotification } = useNotificationStore()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, sessionId: null })
  const [revokeAllModal, setRevokeAllModal] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const { data } = await api.get('/sessions')
      setSessions(data)
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
      addNotification({
        type: 'error',
        message: 'Erro ao carregar sessões ativas'
      })
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (sessionId) => {
    setDeleteModal({ isOpen: true, sessionId })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, sessionId: null })
  }

  const revokeSession = async () => {
    setRevoking(deleteModal.sessionId)
    try {
      await api.delete(`/sessions/${deleteModal.sessionId}`)
      setSessions(sessions.filter(s => s.id !== deleteModal.sessionId))
      addNotification({
        type: 'success',
        message: 'Sessão encerrada com sucesso'
      })
      closeDeleteModal()
      setRevoking(null)
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erro ao encerrar sessão'
      })
      setRevoking(null)
    }
  }

  const openRevokeAllModal = () => {
    setRevokeAllModal(true)
  }

  const closeRevokeAllModal = () => {
    setRevokeAllModal(false)
  }

  const revokeAllSessions = async () => {
    try {
      await api.post('/sessions/revoke-all')
      setSessions(sessions.filter(s => s.isCurrent))
      addNotification({
        type: 'success',
        message: 'Todas as outras sessões foram encerradas'
      })
      closeRevokeAllModal()
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erro ao encerrar sessões'
      })
    }
  }

  const getDeviceIcon = (device) => {
    const deviceLower = device.toLowerCase()
    if (deviceLower.includes('iphone') || deviceLower.includes('android')) {
      return <Smartphone size={24} />
    }
    if (deviceLower.includes('ipad') || deviceLower.includes('tablet')) {
      return <Tablet size={24} />
    }
    return <Monitor size={24} />
  }

  const getBrowserIcon = (browser) => {
    const browserLower = browser.toLowerCase()
    if (browserLower.includes('chrome')) {
      return <Chrome size={16} className="text-blue-500" />
    }
    if (browserLower.includes('firefox')) {
      return <Globe size={16} className="text-orange-500" />
    }
    if (browserLower.includes('safari')) {
      return <Globe size={16} className="text-blue-400" />
    }
    return <Globe size={16} className="text-gray-500" />
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora mesmo'
    if (minutes < 60) return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`
    if (hours < 24) return `Há ${hours} hora${hours > 1 ? 's' : ''}`
    return `Há ${days} dia${days > 1 ? 's' : ''}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const activeSessions = sessions.filter(s => !s.isCurrent)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <Monitor size={24} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sessões Ativas</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gerencie os dispositivos conectados à sua conta
              </p>
            </div>
          </div>

          {activeSessions.length > 0 && (
            <button
              onClick={openRevokeAllModal}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Trash2 size={18} />
              Encerrar Todas
            </button>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Estas são todas as sessões ativas da sua conta. Se você vir alguma atividade ou dispositivo que não reconhece, encerre a sessão e altere sua senha imediatamente.
          </p>
        </div>
      </div>

      {/* Sessões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`bg-white dark:bg-slate-800 rounded-xl border-2 p-6 shadow-sm transition-all hover:shadow-md ${
              session.isCurrent
                ? 'border-green-500 dark:border-green-600'
                : 'border-gray-200 dark:border-slate-700'
            }`}
          >
            {/* Header do Card */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                  session.isCurrent
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {getDeviceIcon(session.device)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {session.os}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sistema Operacional: {session.os} {session.osVersion}
                  </p>
                </div>
              </div>

              {session.isCurrent && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                  <CheckCircle size={14} />
                  Sessão Atual
                </span>
              )}
            </div>

            {/* Informações */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                {getBrowserIcon(session.browser)}
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Navegador:</span> {session.browser} {session.browserVersion}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Localização:</span> {session.location}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Globe size={16} className="text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">IP:</span> {session.ip}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Login em:</span>{' '}
                  {new Date(session.loginAt).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Última Atividade:</span> {formatDate(session.lastActivity)}
                </span>
              </div>
            </div>

            {/* User Agent */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono break-all">
                {session.userAgent}
              </p>
            </div>

            {/* Botão Encerrar */}
            {!session.isCurrent && (
              <div className="mt-4">
                <button
                  onClick={() => openDeleteModal(session.id)}
                  disabled={revoking === session.id}
                  className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  {revoking === session.id ? 'Encerrando...' : 'Encerrar Sessão'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Histórico de Logins */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock size={20} className="text-primary-600 dark:text-primary-400" />
          Histórico de Logins
        </h2>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Clique aqui para mais detalhes sobre os logins e autenticações em suas etapas na página Segurança da Conta.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {sessions.slice(0, 5).map((session) => (
            <div
              key={`history-${session.id}`}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Login</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(session.loginAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-700 dark:text-gray-300">{session.os}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{session.browser}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Confirmação - Encerrar Sessão */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Encerrar Sessão</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Esta ação não pode ser desfeita</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Tem certeza que deseja encerrar esta sessão?
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">⚠️</span>
                  <span>O dispositivo será desconectado imediatamente e precisará fazer login novamente.</span>
                </p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-b-xl flex items-center justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={revokeSession}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Encerrar Sessão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação - Encerrar Todas as Sessões */}
      {revokeAllModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Encerrar Todas as Sessões</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Ação crítica</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Tem certeza que deseja encerrar <strong>todas as outras sessões</strong>?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 font-bold">⚠️</span>
                  <span>Você precisará fazer login novamente em <strong>todos os dispositivos</strong>. Esta ação é irreversível.</span>
                </p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-slate-700/50 rounded-b-xl flex items-center justify-end gap-3">
              <button
                onClick={closeRevokeAllModal}
                className="px-5 py-2.5 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={revokeAllSessions}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <AlertCircle size={18} />
                Encerrar Todas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
