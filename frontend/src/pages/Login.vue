<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Painel de Revendedores</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Faça login para continuar</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">Email</label>
          <input
            v-model="email"
            type="text"
            :disabled="loading || showErrorModal"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Senha</label>
          <input
            v-model="password"
            type="password"
            :disabled="loading || showErrorModal"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading || showErrorModal"
          class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
    </div>

    <!-- Modal de Erro -->
    <Teleport to="body">
      <div
        v-if="showErrorModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.stop
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200" @click.stop>
          <!-- Ícone de Erro -->
          <div class="flex justify-center mb-4">
            <div :class="[getModalIconBg(), 'w-16 h-16 rounded-full flex items-center justify-center']">
              <component :is="getModalIcon()" class="w-8 h-8" :class="getModalIconColor()" />
            </div>
          </div>

          <!-- Mensagem -->
          <div class="text-center mb-6">
            <p class="text-gray-900 dark:text-white text-base leading-relaxed">
              {{ error }}
            </p>
            <div v-if="remaining !== null && remaining > 0" :class="[getRemainingBg(), 'mt-4 p-3 rounded-lg']">
              <p :class="[getRemainingTextColor(), 'text-sm font-medium']">
                {{ getRemainingMessage() }}
              </p>
            </div>
            <div v-if="remaining === 0" class="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p class="text-sm font-medium text-red-800 dark:text-red-300">
                🔒 Conta bloqueada! Aguarde 15 minutos antes de tentar novamente
              </p>
            </div>
          </div>

          <!-- Botão OK -->
          <button
            type="button"
            @click="closeModal"
            class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const remaining = ref(null)
const showErrorModal = ref(false)

// Restaura estado do modal do sessionStorage
onMounted(() => {
  const savedModal = sessionStorage.getItem('loginModalState')
  if (savedModal) {
    try {
      const state = JSON.parse(savedModal)
      if (state.show) {
        showErrorModal.value = true
        error.value = state.error
        remaining.value = state.remaining
      }
    } catch (e) {
      // Ignora erro de parse
    }
  }
})

async function handleSubmit() {
  if (loading.value || showErrorModal.value) return
  
  loading.value = true
  error.value = ''
  remaining.value = null

  try {
    const { data } = await api.post('/auth/login', { 
      email: email.value, 
      password: password.value 
    })
    
    sessionStorage.removeItem('loginModalState')
    authStore.setAuth(data.access_token, data.user)
    router.push('/')
  } catch (err) {
    const errorData = err.response?.data
    const errorMsg = errorData?.error || 'Erro ao fazer login'
    const remainingAttempts = errorData?.remaining ?? null
    
    sessionStorage.setItem('loginModalState', JSON.stringify({
      show: true,
      error: errorMsg,
      remaining: remainingAttempts
    }))
    
    error.value = errorMsg
    remaining.value = remainingAttempts
    showErrorModal.value = true
  } finally {
    loading.value = false
  }
}

function closeModal() {
  sessionStorage.removeItem('loginModalState')
  showErrorModal.value = false
  error.value = ''
  remaining.value = null
  loading.value = false
}

function getModalIcon() {
  if (remaining.value === 0) return 'svg'
  if (remaining.value <= 3) return 'svg'
  if (remaining.value <= 5) return 'svg'
  return 'svg'
}

function getModalIconBg() {
  if (remaining.value === 0) return 'bg-red-100 dark:bg-red-900/30'
  if (remaining.value === 1) return 'bg-red-100 dark:bg-red-900/30'
  if (remaining.value <= 3) return 'bg-orange-100 dark:bg-orange-900/30'
  if (remaining.value <= 5) return 'bg-yellow-100 dark:bg-yellow-900/30'
  return 'bg-blue-100 dark:bg-blue-900/30'
}

function getModalIconColor() {
  if (remaining.value === 0) return 'text-red-600 dark:text-red-400'
  if (remaining.value === 1) return 'text-red-600 dark:text-red-400'
  if (remaining.value <= 3) return 'text-orange-600 dark:text-orange-400'
  if (remaining.value <= 5) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-blue-600 dark:text-blue-400'
}

function getRemainingBg() {
  if (remaining.value === 1) return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
  if (remaining.value <= 3) return 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
  if (remaining.value <= 5) return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
  return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
}

function getRemainingTextColor() {
  if (remaining.value === 1) return 'text-red-800 dark:text-red-300'
  if (remaining.value <= 3) return 'text-orange-800 dark:text-orange-300'
  if (remaining.value <= 5) return 'text-yellow-800 dark:text-yellow-300'
  return 'text-blue-800 dark:text-blue-300'
}

function getRemainingMessage() {
  if (remaining.value === 1) return '🚨 ÚLTIMA TENTATIVA antes do bloqueio de 15 minutos!'
  if (remaining.value <= 3) return `⚠️ ATENÇÃO: Restam apenas ${remaining.value} tentativas!`
  if (remaining.value <= 5) return `⚡ Cuidado: Você tem ${remaining.value} tentativas restantes`
  return `🔐 Por segurança: Você tem ${remaining.value} tentativas restantes`
}
</script>
