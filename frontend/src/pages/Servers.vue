<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Servidores</h1>
      <button @click="showModal = true" class="btn-primary flex items-center gap-2">
        <Plus :size="20" />
        Adicionar Servidor
      </button>
    </div>

    <!-- Grid de Servidores -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="server in servers" :key="server.id" class="card p-6 card-hover">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Server :size="24" class="text-primary" />
            </div>
            <div>
              <h3 class="font-bold text-lg">{{ server.name }}</h3>
              <p class="text-sm text-gray-500">{{ server.url }}</p>
            </div>
          </div>
          <span :class="server.status === 'online' ? 'badge-success' : 'badge-danger'" class="badge">
            {{ server.status === 'online' ? 'Online' : 'Offline' }}
          </span>
        </div>

        <div class="space-y-3 mb-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">Clientes Ativos</span>
            <span class="font-semibold">{{ server.active_clients || 0 }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">Total de Clientes</span>
            <span class="font-semibold">{{ server.total_clients || 0 }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">Conexões</span>
            <span class="font-semibold">{{ server.connections || 0 }}</span>
          </div>
        </div>

        <div class="flex gap-2 pt-4 border-t border-gray-200 dark:border-neutral-700">
          <button @click="editServer(server)" class="flex-1 btn-primary py-2">
            <Edit :size="16" class="inline mr-2" />
            Editar
          </button>
          <button @click="deleteServer(server.id)" class="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Adicionar/Editar Servidor -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="showModal = false">
        <div class="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full p-6" @click.stop>
          <h2 class="text-2xl font-bold mb-6">{{ editingServer ? 'Editar Servidor' : 'Adicionar Servidor' }}</h2>
          
          <form @submit.prevent="saveServer" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Nome do Servidor</label>
              <input v-model="form.name" type="text" required class="input-base" placeholder="Ex: Servidor Principal" />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">URL</label>
              <input v-model="form.url" type="url" required class="input-base" placeholder="http://exemplo.com" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Usuário API</label>
                <input v-model="form.api_username" type="text" required class="input-base" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Senha API</label>
                <input v-model="form.api_password" type="password" required class="input-base" />
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="submit" class="flex-1 btn-primary">
                {{ editingServer ? 'Atualizar' : 'Adicionar' }}
              </button>
              <button type="button" @click="closeModal" class="px-6 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg">
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
import { ref, onMounted } from 'vue'
import { Server, Plus, Edit, Trash2 } from 'lucide-vue-next'
import api from '../services/api'
import { useNotificationStore } from '../stores/notificationStore'

const notificationStore = useNotificationStore()
const servers = ref([])
const loading = ref(false)
const showModal = ref(false)
const editingServer = ref(null)
const form = ref({
  name: '',
  url: '',
  api_username: '',
  api_password: ''
})

async function loadServers() {
  loading.value = true
  try {
    const { data } = await api.get('/servers')
    servers.value = data
  } catch (error) {
    console.error('Erro ao carregar servidores:', error)
    notificationStore.addNotification({
      type: 'error',
      message: 'Erro ao carregar servidores'
    })
  } finally {
    loading.value = false
  }
}

function editServer(server) {
  editingServer.value = server
  form.value = {
    name: server.name,
    url: server.url,
    api_username: server.api_username || '',
    api_password: ''
  }
  showModal.value = true
}

async function saveServer() {
  try {
    if (editingServer.value) {
      await api.put(`/servers/${editingServer.value.id}`, form.value)
      notificationStore.addNotification({
        type: 'success',
        message: 'Servidor atualizado com sucesso'
      })
    } else {
      await api.post('/servers', form.value)
      notificationStore.addNotification({
        type: 'success',
        message: 'Servidor adicionado com sucesso'
      })
    }
    closeModal()
    loadServers()
  } catch (error) {
    console.error('Erro ao salvar servidor:', error)
    notificationStore.addNotification({
      type: 'error',
      message: 'Erro ao salvar servidor'
    })
  }
}

async function deleteServer(id) {
  if (!confirm('Tem certeza que deseja excluir este servidor?')) return
  
  try {
    await api.delete(`/servers/${id}`)
    notificationStore.addNotification({
      type: 'success',
      message: 'Servidor excluído com sucesso'
    })
    loadServers()
  } catch (error) {
    console.error('Erro ao excluir servidor:', error)
    notificationStore.addNotification({
      type: 'error',
      message: 'Erro ao excluir servidor'
    })
  }
}

function closeModal() {
  showModal.value = false
  editingServer.value = null
  form.value = {
    name: '',
    url: '',
    api_username: '',
    api_password: ''
  }
}

onMounted(() => {
  loadServers()
})
</script>
