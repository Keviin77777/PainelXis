<template>
  <div class="space-y-6">
    <div v-if="!isConfigured" class="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 p-4 rounded-xl">
      <div class="flex items-start gap-3">
        <AlertCircle class="text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" :size="20" />
        <div class="flex-1">
          <p class="text-sm text-cyan-900 dark:text-cyan-300 font-medium">
            Novas informações foram adicionadas. Clique aqui para ver.
          </p>
        </div>
      </div>
    </div>

    <!-- Cards de Estatísticas Principais -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <StatsCard
        :icon="Users"
        title="TOTAL DE CLIENTES"
        :value="clientsTotal.total"
        icon-bg="bg-cyan-100 dark:bg-cyan-900/30"
        icon-color="text-cyan-600 dark:text-cyan-400"
      />
      <StatsCard
        :icon="Activity"
        title="TOTAL DE CLIENTES ATIVOS"
        :value="clientsTotal.active"
        icon-bg="bg-green-100 dark:bg-green-900/30"
        icon-color="text-green-600 dark:text-green-400"
      />
      <StatsCard
        :icon="UserPlus"
        title="TOTAL DE REVENDAS"
        :value="resellersTotal.total"
        icon-bg="bg-blue-100 dark:bg-blue-900/30"
        icon-color="text-blue-600 dark:text-blue-400"
      />
      <StatsCard
        :icon="TrendingUp"
        title="TOTAL DE NOVOS CLIENTES"
        :value="stats?.connections?.current || 0"
        icon-bg="bg-purple-100 dark:bg-purple-900/30"
        icon-color="text-purple-600 dark:text-purple-400"
      />
    </div>

    <!-- Layout Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- COLUNA ESQUERDA - CLIENTES -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Estatísticas de Clientes -->
        <div class="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
          <div class="mb-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">ESTATÍSTICAS DE CLIENTES</h2>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStatCard :icon="Users" label="TOTAL DE CLIENTES" :value="clientsTotal.total" icon-color="text-cyan-500" />
            <MiniStatCard :icon="Activity" label="TOTAL DE CLIENTES ATIVOS" :value="clientsTotal.active" icon-color="text-cyan-500" />
            <MiniStatCard :icon="Tv" label="TOTAL DE TESTES" :value="0" icon-color="text-cyan-500" />
            <MiniStatCard :icon="UserPlus" label="TOTAL DE NOVOS CLIENTES" :value="stats?.connections?.current || 0" icon-color="text-cyan-500" />
          </div>
        </div>

        <!-- Expiram em 10 Dias -->
        <div class="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">EXPIRAM EM 10 DIAS</h2>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200 dark:border-slate-700">
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Login</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Vencimento</th>
                  <th class="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="3" class="text-center py-8">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Não foram encontrados resultados</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Mostrando de 0 até 0 de 0 registros
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- COLUNA DIREITA - SIDEBAR -->
      <div class="space-y-6">
        <!-- Testes Rápidos -->
        <div class="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">TESTE RÁPIDO</h2>
          
          <div v-if="stats?.tests && stats.tests.length > 0" class="space-y-3">
            <div
              v-for="(test, index) in stats.tests"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg border border-gray-200 dark:border-neutral-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors cursor-pointer"
            >
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ test.name }}</span>
              </div>
              <span class="px-3 py-1 bg-cyan-500 text-white text-xs font-medium rounded">
                {{ test.server_name }}
              </span>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <div class="w-16 h-16 mx-auto mb-3 bg-gray-100 dark:bg-neutral-800/50 rounded-full flex items-center justify-center">
              <Tv :size="24" class="text-gray-400 dark:text-neutral-500" />
            </div>
            <p class="text-sm text-gray-600 dark:text-neutral-400 mb-2">Nenhum teste configurado</p>
            <p class="text-xs text-gray-500 dark:text-neutral-500">Configure seus planos de teste para visualizá-los aqui</p>
          </div>
        </div>

        <!-- Botão Adicionar Cliente -->
        <button
          @click="$router.push('/clients')"
          class="w-full group relative overflow-hidden bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 border border-gray-200 dark:border-neutral-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02]"
        >
          <div class="relative flex items-center justify-center gap-3">
            <div class="w-10 h-10 bg-gray-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <UserPlus :size="22" class="text-gray-700 dark:text-gray-300" />
            </div>
            <div class="text-left">
              <p class="text-lg font-bold text-gray-900 dark:text-white">ADICIONAR CLIENTE</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">Criar novo cliente no sistema</p>
            </div>
          </div>
        </button>

        <!-- Créditos Disponíveis -->
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign :size="24" />
            </div>
            <div>
              <p class="text-sm font-medium opacity-90">Créditos Disponíveis</p>
              <p class="text-3xl font-bold">R$ {{ stats?.credits || '0,00' }}</p>
            </div>
          </div>
          <p class="text-xs opacity-80">Não reembolsável faturado - Próximos 30 dias</p>
        </div>

        <!-- Revendedores -->
        <div class="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-4">REVENDEDORES</h2>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
              <span class="text-sm text-gray-700 dark:text-gray-300">Total de Revendedores</span>
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ resellersTotal.total }}</span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
              <span class="text-sm text-gray-700 dark:text-gray-300">Revendedores Ativos</span>
              <span class="text-lg font-bold text-green-600 dark:text-green-400">{{ resellersTotal.active }}</span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800/50 rounded-lg">
              <span class="text-sm text-gray-700 dark:text-gray-300">Revendedores Inativos</span>
              <span class="text-lg font-bold text-red-600 dark:text-red-400">{{ resellersTotal.inactive }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Users, Tv, TrendingUp, AlertCircle, DollarSign, UserPlus, Activity } from 'lucide-vue-next'
import api from '../services/api'

const stats = ref(null)
const loading = ref(true)
const isConfigured = ref(false)

const clientsTotal = computed(() => stats.value?.clients?.total || { active: 0, inactive: 0, total: 0 })
const resellersTotal = computed(() => stats.value?.resellers?.total || { active: 0, inactive: 0, total: 0 })

async function loadDashboard() {
  try {
    const { data } = await api.get('/dashboard')
    stats.value = data
    isConfigured.value = data?.is_configured || false
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
    isConfigured.value = false
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<script>
// Componentes auxiliares
import { defineComponent, h } from 'vue'

export const StatsCard = defineComponent({
  props: ['icon', 'title', 'value', 'iconBg', 'iconColor'],
  setup(props) {
    return () => h('div', { class: 'bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 p-6 shadow-sm hover:shadow-md transition-shadow' }, [
      h('div', { class: 'flex items-center gap-4' }, [
        h('div', { class: `w-14 h-14 ${props.iconBg} rounded-xl flex items-center justify-center flex-shrink-0` }, [
          h(props.icon, { size: 28, class: props.iconColor })
        ]),
        h('div', { class: 'flex-1' }, [
          h('p', { class: 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1' }, props.title),
          h('p', { class: 'text-3xl font-bold text-gray-900 dark:text-white' }, props.value.toLocaleString('pt-BR'))
        ])
      ])
    ])
  }
})

export const MiniStatCard = defineComponent({
  props: ['icon', 'label', 'value', 'iconColor'],
  setup(props) {
    return () => h('div', { class: 'bg-gray-50 dark:bg-neutral-800/30 rounded-lg p-4 border border-gray-200 dark:border-neutral-700' }, [
      h('div', { class: 'flex flex-col items-center text-center gap-2' }, [
        h(props.icon, { size: 32, class: props.iconColor }),
        h('div', {}, [
          h('p', { class: 'text-2xl font-bold text-gray-900 dark:text-white' }, props.value.toLocaleString('pt-BR')),
          h('p', { class: 'text-xs text-gray-600 dark:text-gray-400 mt-1' }, props.label)
        ])
      ])
    ])
  }
})
</script>
