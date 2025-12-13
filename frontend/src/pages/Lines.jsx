import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Power } from 'lucide-react'
import api from '../services/api'

export default function Lines() {
  const [lines, setLines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLines()
  }, [])

  const loadLines = async () => {
    try {
      const { data } = await api.get('/lines')
      setLines(data)
    } catch (error) {
      console.error('Erro ao carregar linhas:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteLine = async (id) => {
    if (!confirm('Deseja realmente excluir esta linha?')) return
    try {
      await api.delete(`/lines/${id}`)
      loadLines()
    } catch (error) {
      console.error('Erro ao excluir linha:', error)
    }
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Linhas</h2>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
          <Plus size={20} />
          Nova Linha
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Expira em</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Conexões</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {lines.map((line) => (
              <tr key={line.id}>
                <td className="px-6 py-4">{line.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    line.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {line.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4">{line.exp_date}</td>
                <td className="px-6 py-4">{line.active_cons}/{line.max_connections}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteLine(line.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
