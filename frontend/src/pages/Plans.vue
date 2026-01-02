<template>
  <div class="space-y-4">
    <!-- Barra de pesquisa e botão adicionar -->
    <div class="card rounded p-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pesquisar"
            class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            style="font-size: 13px;"
          />
        </div>
        <button 
          @click="showModal = true" 
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Plus :size="18" />
          Adicionar
        </button>
      </div>
    </div>

    <!-- Tabela de Planos -->
    <div class="card rounded overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full" style="font-size: 15px;">
          <thead class="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
            <tr>
              <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" style="font-size: 13px;">Servidor</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" style="font-size: 13px;">Plano</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" style="font-size: 13px;">Situação</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" style="font-size: 13px;">Teste</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" style="font-size: 13px;">Valor do Plano</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" style="font-size: 13px;">Créditos</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" style="font-size: 13px;">Conexões</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" style="font-size: 13px;">Duração</th>
              <th class="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" style="font-size: 13px;">Ordem</th>
              <th class="px-6 py-3 text-right font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" style="font-size: 13px;">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-neutral-700">
            <tr v-if="filteredPlans.length === 0">
              <td colspan="10" class="text-center py-12 text-gray-500 dark:text-gray-400">
                Nenhum plano encontrado
              </td>
            </tr>
            <tr v-else v-for="(plan, index) in filteredPlans" :key="plan.id" 
                :class="index % 2 === 0 ? 'bg-white dark:bg-neutral-900' : 'bg-gray-50 dark:bg-neutral-800/50'"
                class="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                style="color: #1f2937;">
              <td class="px-6 py-4 dark:!text-gray-100">{{ plan.server_name || 'CINE PULSE' }}</td>
              <td class="px-6 py-4">
                <div class="font-medium text-blue-600 dark:text-blue-400">{{ plan.name }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ plan.description || 'ID do Plano no Servidor: ' + plan.id }}</div>
              </td>
              <td class="px-6 py-4">
                <span :class="plan.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'" 
                      class="px-2.5 py-1 text-sm font-semibold rounded">
                  {{ plan.is_active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2.5 py-1 text-sm font-semibold rounded">
                  Sim
                </span>
              </td>
              <td class="px-6 py-4 dark:!text-gray-100">{{ plan.price ? 'R$ ' + plan.price : '-' }}</td>
              <td class="px-6 py-4 dark:!text-gray-100">{{ plan.credits || '0' }}</td>
              <td class="px-6 py-4 dark:!text-gray-100">{{ plan.max_connections || '1' }}</td>
              <td class="px-6 py-4 dark:!text-gray-100">{{ formatDuration(plan.duration_days) }}</td>
              <td class="px-6 py-4 dark:!text-gray-100">{{ plan.order || '0' }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="editPlan(plan)" 
                    class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    style="font-size: 14px;"
                  >
                    Editar
                  </button>
                  <button 
                    @click="deletePlan(plan.id)" 
                    class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    style="font-size: 14px;"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginação -->
      <div class="border-t border-gray-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-neutral-800/50">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          1 até 23 de 23
        </div>
        <div class="flex gap-2">
          <button class="px-4 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded disabled:opacity-50" disabled>
            Anterior
          </button>
          <span class="px-4 py-2 text-sm">1</span>
          <button class="px-4 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded disabled:opacity-50" disabled>
            Seguinte
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="showModal = false">
        <div class="bg-white dark:bg-neutral-900 rounded-lg shadow-2xl max-w-2xl w-full p-8" @click.stop>
          <h2 class="text-xl font-bold mb-6">{{ editingPlan ? 'Editar Plano' : 'Adicionar Plano' }}</h2>
          
          <form @submit.prevent="savePlan" class="space-y-4">
            <div>
              <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">Nome do Plano</label>
              <input v-model="form.name" type="text" required class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" style="font-size: 13px;" />
            </div>

            <div>
              <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">Descrição</label>
              <textarea v-model="form.description" rows="3" class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" style="font-size: 13px;"></textarea>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">Duração (dias)</label>
                <input v-model.number="form.duration_days" type="number" required class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" style="font-size: 13px;" />
              </div>
              <div>
                <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">Conexões</label>
                <input v-model.number="form.max_connections" type="number" required class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" style="font-size: 13px;" />
              </div>
              <div>
                <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">Preço (R$)</label>
                <input v-model="form.price" type="text" required class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" style="font-size: 13px;" />
              </div>
            </div>

            <div class="flex items-center gap-2">
              <input v-model="form.is_active" type="checkbox" id="is_active" class="w-4 h-4" />
              <label for="is_active" class="font-medium text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">Plano Ativo</label>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded transition-colors">
                {{ editingPlan ? 'Atualizar' : 'Adicionar' }}
              </button>
              <button type="button" @click="closeModal" class="flex-1 bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import api from '../services/api'
import { useNotificationStore } from '../stores/notificationStore'

const notificationStore = useNotificationStore()
const plans = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingPlan = ref(null)
const searchQuery = ref('')
const form = ref({
  name: '',
  description: '',
  duration_days: 30,
  max_connections: 1,
  price: '0.00',
  is_active: true
})

const filteredPlans = computed(() => {
  if (!searchQuery.value) return plans.value
  
  const query = searchQuery.value.toLowerCase()
  return plans.value.filter(plan => 
    plan.name?.toLowerCase().includes(query) ||
    plan.description?.toLowerCase().includes(query)
  )
})

function formatDuration(days) {
  if (!days) return '-'
  if (days < 30) return `${days} dias`
  if (days === 30) return '1 Mês'
  if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months} ${months === 1 ? 'Mês' : 'Meses'}`
  }
  const years = Math.floor(days / 365)
  return `${years} ${years === 1 ? 'Ano' : 'Anos'}`
}

async function loadPlans() {
  loading.value = true
  try {
    const { data } = await api.get('/plans')
    plans.value = data
  } catch (error) {
    console.error('Erro ao carregar planos:', error)
  } finally {
    loading.value = false
  }
}

function editPlan(plan) {
  editingPlan.value = plan
  form.value = { ...plan }
  showModal.value = true
}

async function savePlan() {
  try {
    if (editingPlan.value) {
      await api.put(`/plans/${editingPlan.value.id}`, form.value)
      notificationStore.addNotification({
        type: 'success',
        message: 'Plano atualizado com sucesso'
      })
    } else {
      await api.post('/plans', form.value)
      notificationStore.addNotification({
        type: 'success',
        message: 'Plano adicionado com sucesso'
      })
    }
    closeModal()
    loadPlans()
  } catch (error) {
    console.error('Erro ao salvar plano:', error)
    notificationStore.addNotification({
      type: 'error',
      message: 'Erro ao salvar plano'
    })
  }
}

async function deletePlan(id) {
  if (!confirm('Tem certeza que deseja excluir este plano?')) return
  
  try {
    await api.delete(`/plans/${id}`)
    notificationStore.addNotification({
      type: 'success',
      message: 'Plano excluído com sucesso'
    })
    loadPlans()
  } catch (error) {
    console.error('Erro ao excluir plano:', error)
    notificationStore.addNotification({
      type: 'error',
      message: 'Erro ao excluir plano'
    })
  }
}

function closeModal() {
  showModal.value = false
  editingPlan.value = null
  form.value = {
    name: '',
    description: '',
    duration_days: 30,
    max_connections: 1,
    price: '0.00',
    is_active: true
  }
}

onMounted(() => {
  loadPlans()
})
</script>

<style scoped>
/* Forçar cores dos textos da tabela */
table tbody tr td {
  color: #1f2937 !important;
}

html[data-bs-theme="dark"] table tbody tr td,
.dark table tbody tr td {
  color: #f3f4f6 !important;
}

/* Manter cores dos badges */
table tbody tr td span {
  color: inherit !important;
}

/* Manter cor do link do plano */
table tbody tr td div.font-medium {
  color: #2563eb !important;
}

html[data-bs-theme="dark"] table tbody tr td div.font-medium,
.dark table tbody tr td div.font-medium {
  color: #60a5fa !important;
}
</style>
