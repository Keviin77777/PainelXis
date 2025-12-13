import { useState, useEffect } from 'react'
import { CreditCard, DollarSign, Package, AlertCircle, Check, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function BuyCredits() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState(null)

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      const { data } = await api.get('/credit-packages')
      setPackages(data || [])
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error)
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = (pkg) => {
    setSelectedPackage(pkg)
    // Aqui você implementaria a lógica de pagamento
    alert(`Compra de ${pkg.credits} créditos por R$ ${pkg.price.toFixed(2)}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={40} className="text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Nenhum Pacote Disponível
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Os pacotes de créditos ainda não foram configurados. Configure os pacotes para permitir que os usuários comprem créditos.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                    Como configurar pacotes de créditos:
                  </p>
                  <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                    <li>Acesse o menu <strong>Sistema</strong></li>
                    <li>Clique em <strong>Pacote de Créditos (Preço)</strong></li>
                    <li>Adicione os pacotes com valores e quantidades</li>
                    <li>Salve e os pacotes aparecerão aqui automaticamente</li>
                  </ol>
                </div>
              </div>
            </div>
            <Link
              to="/credit-packages-price"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Settings size={20} />
              Configurar Pacotes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Comprar Créditos</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Escolha um pacote de créditos para recarregar sua conta
        </p>
      </div>

      {/* Saldo Atual */}
      <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Saldo Atual</p>
            <p className="text-4xl font-bold">R$ 0,00</p>
            <p className="text-xs opacity-75 mt-1">0 créditos disponíveis</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <DollarSign size={32} />
          </div>
        </div>
      </div>

      {/* Pacotes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white dark:bg-slate-800 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-lg"
          >
            <div className="p-6">
              {/* Header do Card */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={32} className="text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {pkg.credits} Créditos
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">R$</span>
                  <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    {pkg.price.toFixed(2).split('.')[0]}
                  </span>
                  <span className="text-xl text-gray-500 dark:text-gray-400">
                    ,{pkg.price.toFixed(2).split('.')[1]}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  R$ {(pkg.price / pkg.credits).toFixed(4)} por crédito
                </p>
              </div>

              {/* Benefícios */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Créditos válidos por 1 ano</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Ativação imediata</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-green-500 flex-shrink-0" />
                  <span>Suporte prioritário</span>
                </div>
                {pkg.bonus && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                    <Check size={16} className="flex-shrink-0" />
                    <span>+{pkg.bonus}% de bônus</span>
                  </div>
                )}
              </div>

              {/* Botão de Compra */}
              <button
                onClick={() => handlePurchase(pkg)}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={20} />
                Comprar Agora
              </button>
            </div>

            {/* Badge de Destaque */}
            {pkg.featured && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 rounded-b-xl text-sm font-semibold">
                🔥 Mais Popular
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Informações Adicionais */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Informações sobre Créditos
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Os créditos são adicionados automaticamente após a confirmação do pagamento</li>
              <li>• Você pode usar os créditos para criar linhas, usuários e outros serviços</li>
              <li>• Os créditos não expiram e podem ser usados a qualquer momento</li>
              <li>• Em caso de dúvidas, entre em contato com o suporte</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
