<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Avisos</h1>
      <button class="btn-primary flex items-center gap-2">
        <Plus :size="20" />
        Novo Aviso
      </button>
    </div>

    <div class="space-y-4">
      <div v-for="notice in notices" :key="notice.id" class="card p-6">
        <div class="flex items-start gap-4">
          <div :class="getIconBg(notice.type)" class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
            <component :is="getIcon(notice.type)" :size="24" :class="getIconColor(notice.type)" />
          </div>
          <div class="flex-1">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-bold text-lg">{{ notice.title }}</h3>
                <p class="text-sm text-gray-500 mt-1">{{ notice.message }}</p>
                <p class="text-xs text-gray-400 mt-2">{{ formatDate(notice.created_at) }}</p>
              </div>
              <span :class="getBadge(notice.type)" class="badge">
                {{ getTypeText(notice.type) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="notices.length === 0" class="card p-12 text-center">
        <Bell :size="48" class="mx-auto text-gray-400 mb-4" />
        <p class="text-gray-500">Nenhum aviso no momento</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Bell, Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-vue-next'
import api from '../services/api'
import { format } from 'date-fns'

const notices = ref([])

async function loadNotices() {
  try {
    const { data } = await api.get('/notices')
    notices.value = data
  } catch (error) {
    console.error('Erro ao carregar avisos:', error)
  }
}

function getIcon(type) {
  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: AlertCircle
  }
  return icons[type] || Info
}

function getIconBg(type) {
  const bgs = {
    info: 'bg-blue-100 dark:bg-blue-900/20',
    warning: 'bg-yellow-100 dark:bg-yellow-900/20',
    success: 'bg-green-100 dark:bg-green-900/20',
    error: 'bg-red-100 dark:bg-red-900/20'
  }
  return bgs[type] || 'bg-gray-100 dark:bg-neutral-800'
}

function getIconColor(type) {
  const colors = {
    info: 'text-blue-600 dark:text-blue-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400'
  }
  return colors[type] || 'text-gray-600'
}

function getBadge(type) {
  const badges = {
    info: 'badge-primary',
    warning: 'badge-warning',
    success: 'badge-success',
    error: 'badge-danger'
  }
  return badges[type] || 'badge'
}

function getTypeText(type) {
  const texts = {
    info: 'Informação',
    warning: 'Aviso',
    success: 'Sucesso',
    error: 'Erro'
  }
  return texts[type] || type
}

function formatDate(date) {
  if (!date) return '-'
  return format(new Date(date), 'dd/MM/yyyy HH:mm')
}

onMounted(() => {
  loadNotices()
})
</script>
