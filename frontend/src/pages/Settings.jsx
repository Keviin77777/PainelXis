import { useState, useEffect } from 'react'
import { Save, Server, Key, TestTube } from 'lucide-react'
import api from '../services/api'

export default function Settings() {
  const [config, setConfig] = useState({
    api_url: '',
    api_code: '',
    timeout: 30
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const { data } = await api.get('/settings/admin-api')
      setConfig(data)
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post('/settings/admin-api', config)
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const { data } = await api.post('/settings/admin-api/test', config)
      setTestResult({ success: true, message: 'Conexão bem-sucedida!', data })
    } catch (error) {
      setTestResult({ success: false, message: error.response?.data?.error || 'Falha na conexão' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações da Admin API</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure a conexão com o servidor Admin API
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Server size={18} />
            URL do Servidor
          </label>
          <input
            type="text"
            value={config.api_url}
            onChange={(e) => setConfig({ ...config, api_url: e.target.value })}
            placeholder="http://seu-servidor-ip"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Exemplo: http://192.168.1.100 ou http://seu-dominio.com
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Key size={18} />
            Código de Acesso Admin
          </label>
          <input
            type="password"
            value={config.api_code}
            onChange={(e) => setConfig({ ...config, api_code: e.target.value })}
            placeholder="Seu código de acesso admin"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Timeout (segundos)
          </label>
          <input
            type="number"
            value={config.timeout}
            onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.success 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}>
            <p className="font-medium">{testResult.message}</p>
            {testResult.data && (
              <pre className="text-xs mt-2 overflow-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleTest}
            disabled={testing || !config.api_url || !config.api_code}
            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <TestTube size={20} />
            {testing ? 'Testando...' : 'Testar Conexão'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !config.api_url || !config.api_code}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
          📋 Informações Importantes
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <li>• O servidor Admin API deve estar acessível pela rede</li>
          <li>• Certifique-se de que o código de acesso está correto</li>
          <li>• Use HTTPS em produção para maior segurança</li>
          <li>• Teste a conexão antes de salvar as configurações</li>
        </ul>
      </div>
    </div>
  )
}
