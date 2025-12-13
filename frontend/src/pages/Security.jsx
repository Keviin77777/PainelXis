import { useState } from 'react'
import { Shield, Lock, Key, Eye, EyeOff, Smartphone, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'
import { useNotificationStore } from '../store/notificationStore'

export default function Security() {
  const { addNotification } = useNotificationStore()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [twoFactorStatus, setTwoFactorStatus] = useState({
    authenticator: false,
    email: true,
    telegram: false,
    whatsapp: false
  })

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addNotification({
        type: 'error',
        message: 'As senhas não coincidem'
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      addNotification({
        type: 'error',
        message: 'A senha deve ter no mínimo 8 caracteres'
      })
      return
    }

    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setShowPasswordForm(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      addNotification({
        type: 'success',
        message: 'Senha alterada com sucesso!'
      })
    }, 1000)
  }

  const handleToggle2FA = (method) => {
    setTwoFactorStatus({ ...twoFactorStatus, [method]: !twoFactorStatus[method] })
    addNotification({
      type: 'info',
      message: `Verificação em duas etapas via ${method === 'authenticator' ? 'Aplicativo' : method === 'email' ? 'E-mail' : method === 'telegram' ? 'Telegram' : 'WhatsApp'} ${!twoFactorStatus[method] ? 'ativada' : 'desativada'}`
    })
  }

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    if (strength <= 2) return { strength: 33, label: 'Fraca', color: 'bg-red-500' }
    if (strength <= 3) return { strength: 66, label: 'Média', color: 'bg-yellow-500' }
    return { strength: 100, label: 'Forte', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <Shield size={24} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Segurança da Conta</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gerencie suas configurações de segurança e autenticação
            </p>
          </div>
        </div>
      </div>

      {/* Senha */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-primary-600 dark:text-primary-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Senha</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {showPasswordForm ? 'Preencha os campos abaixo para alterar sua senha' : 'A senha precisa ter pelo menos 8 caracteres'}
              </p>
            </div>
          </div>
          
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all"
            >
              Alterar Senha
            </button>
          )}
        </div>

        {!showPasswordForm ? (
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Senha Atual</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">••••••••••••</p>
            </div>
            <CheckCircle size={20} className="text-green-500" />
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Depois de alterar sua senha você precisará fazer login novamente em todos os outros dispositivos.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha Atual <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nova Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {passwordData.newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Força da senha: <span className={passwordStrength.strength === 100 ? 'text-green-600' : passwordStrength.strength === 66 ? 'text-yellow-600' : 'text-red-600'}>
                        {passwordStrength.label}
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Nova Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {saving ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Verificação em Duas Etapas */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={20} className="text-primary-600 dark:text-primary-400" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Verificação em Duas Etapas</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Adicione uma camada extra de segurança à sua conta
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Aplicativo Autenticador */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Smartphone size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Aplicativo Autenticador</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use um aplicativo de autenticação da navegador para obter códigos de verificação em duas etapas quando solicitado
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle2FA('authenticator')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                twoFactorStatus.authenticator
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {twoFactorStatus.authenticator ? 'Desativar' : 'Configurar'}
            </button>
          </div>

          {/* E-mail */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Mail size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">E-mail</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receba um código via Email
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle2FA('email')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                twoFactorStatus.email
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {twoFactorStatus.email ? 'Desativar' : 'Configurar'}
            </button>
          </div>

          {/* Telegram */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center">
                <MessageSquare size={20} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Telegram</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receba um código via Telegram
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle2FA('telegram')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                twoFactorStatus.telegram
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {twoFactorStatus.telegram ? 'Desativar' : 'Configurar'}
            </button>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <MessageSquare size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">WhatsApp</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receba um código via WhatsApp
                </p>
                {!twoFactorStatus.whatsapp && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Você deve configurar o BotBet para usar este recurso
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleToggle2FA('whatsapp')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                twoFactorStatus.whatsapp
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {twoFactorStatus.whatsapp ? 'Desativar' : 'Configurar BotBet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
