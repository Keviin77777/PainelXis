import { useState } from 'react'
import { User, Mail, Phone, Globe, Save, Camera, Calendar, MapPin, MessageSquare, Bell, Eye } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'

export default function Profile() {
  const { user } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const [formData, setFormData] = useState({
    name: user?.name || 'Administrador',
    email: user?.email || 'admin@admin.com',
    telegram: '',
    whatsapp: '',
    timezone: 'America/Sao_Paulo',
    allowMasterRenewMonthly: false,
    allowMasterViewPersonalData: false,
    showDashboardGains: true,
    showDashboardFilters: true
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      addNotification({
        type: 'success',
        message: 'Perfil atualizado com sucesso!'
      })
    }, 1000)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header com Avatar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700"></div>
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-16">
            <div className="relative">
              <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-xl">
                <User size={56} className="text-gray-400" />
              </div>
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110">
                <Camera size={18} />
              </button>
            </div>
            
            <div className="flex-1 pt-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{formData.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                <Mail size={16} />
                {formData.email}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>Membro desde Dez 2024</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span>Brasil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações de Contato */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <User size={20} className="text-primary-600 dark:text-primary-400" />
            Informações de Contato
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-mail <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telegram
              </label>
              <div className="relative">
                <MessageSquare size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleChange}
                  placeholder="https://t.me/+55-XXXXXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Mostre seu Telegram para os mais revendas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WhatsApp
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="14997529823"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Número no Whatsapp com o seu código do país + o seu número. Ex: 55 11 99999 9999
              </p>
            </div>
          </div>
        </div>

        {/* Preferências do Sistema */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Globe size={20} className="text-primary-600 dark:text-primary-400" />
            Preferências do Sistema
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fuso Horário
            </label>
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            >
              <option value="America/Sao_Paulo">America/Sao_Paulo</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>
        </div>

        {/* Permissões */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Bell size={20} className="text-primary-600 dark:text-primary-400" />
            Permissões
          </h2>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Permitir que meu master renove meus mensalistas</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, allowMasterRenewMonthly: false })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    !formData.allowMasterRenewMonthly
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, allowMasterRenewMonthly: true })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    formData.allowMasterRenewMonthly
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Sim
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Permitir que meu master veja os dados pessoais dos meus clientes e revendas</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, allowMasterViewPersonalData: false })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    !formData.allowMasterViewPersonalData
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, allowMasterViewPersonalData: true })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    formData.allowMasterViewPersonalData
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Sim
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Mostrar ganhos na Dashboard</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showDashboardGains: false })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    !formData.showDashboardGains
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showDashboardGains: true })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    formData.showDashboardGains
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Sim
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Lembrar filtro das páginas</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showDashboardFilters: false })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    !formData.showDashboardFilters
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showDashboardFilters: true })}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    formData.showDashboardFilters
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  Sim
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex items-center justify-end gap-3 sticky bottom-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-lg">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Save size={20} />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
