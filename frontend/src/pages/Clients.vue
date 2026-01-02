 <template>
  <div class="space-y-6">
    <!-- Filtros e Botão Criar -->
    <div class="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm p-6">
      <div class="flex items-end justify-between gap-4">
        <!-- Filtros à esquerda -->
        <div class="flex-1 grid grid-cols-10 gap-4 items-end">
          <div class="col-span-2">
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Mostrar</label>
            <CustomSelect
              v-model="filters.perPage"
              :options="perPageOptions"
              placeholder="Selecione..."
            />
          </div>
          
          <div class="col-span-2">
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Completo de</label>
            <CustomSelect
              v-model="filters.status"
              :options="statusOptions"
              placeholder="Todos"
            />
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Filtros</label>
            <CustomSelect
              v-model="filters.filter"
              :options="filterOptions"
              placeholder="Sem filtro"
            />
          </div>

          <div class="col-span-3">
            <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Buscar</label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Buscar cliente..."
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#006AE6] outline-none transition-colors"
            />
          </div>

          <div class="col-span-1">
            <button @click="loadClients" class="w-full bg-[#006AE6] hover:bg-[#1570d9] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <Search :size="18" />
              Pesquisar
            </button>
          </div>
        </div>

        <!-- Botão Criar Cliente à direita -->
        <div class="flex-shrink-0">
          <button @click="openCreateModal" class="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
            <Plus :size="18" />
            Criar Cliente
          </button>
        </div>
      </div>
    </div>

    <!-- Tabela de Clientes -->
    <div class="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Id</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Login</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Servidor</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Adicionado</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Vencimento</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Mostrar</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Conexões</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Notas</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-neutral-700">
            <tr v-if="loading">
              <td colspan="10" class="text-center py-12">
                <div class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="clients.length === 0">
              <td colspan="10" class="text-center py-12 text-gray-500 dark:text-gray-400">
                Nenhum cliente encontrado
              </td>
            </tr>
            <tr v-else v-for="client in clients" :key="client.id" class="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{{ client.id }}</td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{{ client.username }}</td>
              <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{{ client.server_name }}</td>
              <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(client.created_at) }}</td>
              <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(client.expires_at) }}</td>
              <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{{ client.plan_name }}</td>
              <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{{ client.connections || 0 }}</td>
              <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{{ client.notes || '-' }}</td>
              <td class="px-6 py-4">
                <span :class="getStatusBadge(client.status)" class="px-2 py-1 text-xs font-semibold rounded">
                  {{ getStatusText(client.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-1">
                  <button class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-blue-600 dark:text-blue-400" title="Editar">
                    <Edit :size="16" />
                  </button>
                  <button class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-blue-600 dark:text-blue-400" title="Copiar">
                    <Copy :size="16" />
                  </button>
                  <button class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-blue-600 dark:text-blue-400" title="Renovar">
                    <RefreshCw :size="16" />
                  </button>
                  <button class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-blue-600 dark:text-blue-400" title="Detalhes">
                    <Eye :size="16" />
                  </button>
                  <button class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-blue-600 dark:text-blue-400" title="Mensagem">
                    <Mail :size="16" />
                  </button>
                  <button class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-blue-600 dark:text-blue-400" title="Histórico">
                    <Clock :size="16" />
                  </button>
                  <button class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-blue-600 dark:text-blue-400" title="Dispositivos">
                    <Smartphone :size="16" />
                  </button>
                  <button class="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-red-600 dark:text-red-400" title="Excluir">
                    <Trash2 :size="16" />
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
          Mostrando de {{ pagination.from }} até {{ pagination.to }} de {{ pagination.total }} registros
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="px-4 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
          >
            Anterior
          </button>
          <span class="px-4 py-2 text-sm">
            {{ pagination.current_page }}
          </span>
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="px-4 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-lg disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
          >
            Seguinte
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Edit, Trash2, Copy, RefreshCw, Eye, Mail, Clock, Smartphone, Plus } from 'lucide-vue-next'
import CustomSelect from '../components/CustomSelect.vue'
import api from '../services/api'
import { format } from 'date-fns'

const router = useRouter()

const clients = ref([])
const loading = ref(false)
const filters = ref({
  search: '',
  status: '',
  filter: '',
  perPage: '10'
})

// Opções para os selects customizados
const perPageOptions = [
  { value: '10', label: '10' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' }
]

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'expired', label: 'Expirados' }
]

const filterOptions = [
  { value: '', label: 'Sem filtro' },
  { value: 'expiring', label: 'Expirando' },
  { value: 'expired', label: 'Expirados' }
]

const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0
})

async function loadClients(page = 1) {
  loading.value = true
  try {
    const { data } = await api.get('/clients', {
      params: {
        page,
        per_page: filters.value.perPage,
        search: filters.value.search,
        status: filters.value.status,
        filter: filters.value.filter
      }
    })
    clients.value = data.data
    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      from: data.from,
      to: data.to,
      total: data.total
    }
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.last_page) {
    loadClients(page)
  }
}

function getStatusBadge(status) {
  const badges = {
    active: 'bg-green-500 text-white',
    inactive: 'bg-red-500 text-white',
    expired: 'bg-yellow-500 text-white'
  }
  return badges[status] || 'bg-gray-500 text-white'
}

function getStatusText(status) {
  const texts = {
    active: 'Ativo',
    inactive: 'Inativo',
    expired: 'Expirado'
  }
  return texts[status] || status
}

function formatDate(date) {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy HH:mm')
}

function openCreateModal() {
  router.push('/clients/add')
}

onMounted(() => {
  loadClients()
})
</script>
