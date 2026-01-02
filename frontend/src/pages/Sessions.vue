<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Sessões Ativas</h1>
        <p class="text-sm text-gray-500 mt-1">Gerencie suas sessões de login ativas</p>
      </div>
      <button @click="revokeAllSessions" class="btn-danger flex items-center gap-2">
        <LogOut :size="20" />
        Encerrar Todas
      </button>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else class="space-y-4">
      <div v-for="session in sessions" :key="session.id" class="card p-6">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Monitor :size="24" class="text-primary" />
            </div>
            <div>
              <h3 class="font-bold">{{ session.device || 'Dispositivo Desconhecido' }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ session.ip_address }}</p>
              <p class="text-xs text-gray-400 mt-2">
                Último acesso: {{ formatDate(session.last_activity) }}
              </p>
              <span v-if="session.is_current" class="badge badge-success mt-2">Sessão Atual</span>
            </div>
          </div>
          <button
            v-if="!session.is_current"
            @click="revokeSession(session.id)"
            class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600"
          >
            <Trash2 :size="20" />
          </button>
        </div>
      </div>

      <div v-if="sessions.length === 0" class="card p-12 text-center">
        <Shield :size="48" class="mx-auto text-gray-400 mb-4" />
        <p class="text-gray-500">Nenhuma sessão ativa encontrada</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Monitor, LogOut, Trash2, Shield } from 'lucide-vue-next'
import api from '../services/api'
import { useNotificationStore } from '../stores/notificationStore'
import { format } from 'date-fns'

const notificationStore = useNotificationStore()
const sessions = ref([])
const loading = ref(false)

async function loadSessions() {
  loading.value = true
  try {
    const { data } = await api.get('/sessions')
    sessions.value = data
  } catch (error) {
    console.error('Erro ao carregar sessões:', error)
  } finally {
    loading.value = false
  }
}

async function revokeSession(id) {
  if (!confirm('Tem certeza que deseja encerrar esta sessão?')) return
  
  try {
    await api.delete(`/sessions/${id}`)
    notificationStore.addNotification({
      type: 'success',
      message: 'Sessão encerrada com sucesso'
    })
    loadSessions()
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error)
    notificationStore.addNotification({
      type: 'error',
      message: 'Erro ao encerrar sessão'
    })
  }
}

async function revokeAllSessions() {
  if (!confirm('Tem certeza que deseja encerrar todas as sessões? Você será desconectado.')) return
  
  try {
    await api.post('/sessions/revoke-all')
    notificationStore.addNotification({
      type: 'success',
      message: 'Todas as sessões foram encerradas'
    })
    window.location.href = '/login'
  } catch (error) {
    console.error('Erro ao encerrar sessões:', error)
    notificationStore.addNotification({
      type: 'error',
      message: 'Erro ao encerrar sessões'
    })
  }
}

function formatDate(date) {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy HH:mm')
}

onMounted(() => {
  loadSessions()
})
</script>
