import { useState } from 'react'
import { Plus, Bell, Calendar, Eye, EyeOff, Edit, Trash2, AlertCircle } from 'lucide-react'

export default function Notices() {
  const [notices, setNotices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
    visibleFrom: '',
    visibleUntil: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newNotice = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    }
    setNotices([...notices, newNotice])
    setShowForm(false)
    setFormData({
      title: '',
      description: '',
      order: 0,
      visibleFrom: '',
      visibleUntil: ''
    })
  }

  const deleteNotice = (id) => {
    if (confirm('Deseja realmente excluir este aviso?')) {
      setNotices(notices.filter(n => n.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Avisos</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gerencie os avisos exibidos para seus usuários
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          Novo Aviso
        </button>
      </div>

      {/* Estado Vazio */}
      {notices.length === 0 && !showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum aviso cadastrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Crie avisos importantes para manter seus usuários informados sobre atualizações, manutenções ou novidades do sistema.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Criar Primeiro Aviso
            </button>
          </div>
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {formData.id ? 'Editar Aviso' : 'Novo Aviso'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Digite o título do aviso"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o conteúdo do aviso..."
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Você pode usar formatação básica como quebras de linha
              </p>
            </div>

            {/* Ordem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordem de Exibição
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <AlertCircle size={14} className="inline mr-1" />
                Números menores aparecem primeiro. Use valores negativos (ex: -999) para prioridade máxima
              </p>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visível a partir de
                </label>
                <input
                  type="datetime-local"
                  value={formData.visibleFrom}
                  onChange={(e) => setFormData({ ...formData, visibleFrom: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Visível até
                </label>
                <input
                  type="datetime-local"
                  value={formData.visibleUntil}
                  onChange={(e) => setFormData({ ...formData, visibleUntil: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Salvar Aviso
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({
                    title: '',
                    description: '',
                    order: 0,
                    visibleFrom: '',
                    visibleUntil: ''
                  })
                }}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Avisos */}
      {notices.length > 0 && (
        <div className="space-y-4">
          {notices.sort((a, b) => a.order - b.order).map((notice) => (
            <div
              key={notice.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {notice.title}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                      Ordem: {notice.order}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap mb-4">
                    {notice.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {notice.visibleFrom && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>De: {new Date(notice.visibleFrom).toLocaleString('pt-BR')}</span>
                      </div>
                    )}
                    {notice.visibleUntil && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Até: {new Date(notice.visibleUntil).toLocaleString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      setFormData(notice)
                      setShowForm(true)
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit size={18} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => deleteNotice(notice.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
