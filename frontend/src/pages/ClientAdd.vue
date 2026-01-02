<template>
  <div class="flex justify-center px-4">
    <div class="space-y-4 w-full" style="max-width: 800px;">
      <!-- Alerta de erro -->
      <div v-if="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
        <p class="text-xs text-red-800 dark:text-red-200">{{ errorMessage }}</p>
      </div>

      <!-- Formulário -->
      <div class="card rounded p-10">
        <!-- Header com abas -->
        <div class="border-b border-gray-200 dark:border-neutral-700 mb-6">
          <div class="pb-3">
            <button class="text-sm text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 pb-2">
              Detalhes
            </button>
          </div>
        </div>

        <!-- Conteúdo do formulário -->
        <div class="space-y-5" style="font-size: 13px;">
        <!-- Servidor -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            Servidor <span class="text-red-500">*</span>
          </label>
          <CustomSelect
            v-model="form.server_id"
            :options="serverOptions"
            placeholder="Selecione um servidor"
          />
        </div>

        <!-- Plano -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            Plano <span class="text-red-500">*</span>
          </label>
          <CustomSelect
            v-model="form.plan_id"
            :options="planOptions"
            placeholder="Selecione um plano"
          />
        </div>

        <!-- Conexões -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            Conexões <span class="text-red-500">*</span>
          </label>
          <div class="flex items-center gap-2 max-w-xs">
            <button 
              @click="decrementConnections"
              class="px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
              style="font-size: 13px;"
            >
              -
            </button>
            <input
              v-model.number="form.connections"
              type="number"
              min="1"
              class="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-center"
              style="font-size: 13px;"
            />
            <button 
              @click="incrementConnections"
              class="px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
              style="font-size: 13px;"
            >
              +
            </button>
          </div>
          <p class="mt-2 text-sm text-blue-600 dark:text-blue-400">
            Você tem créditos ilimitados
          </p>
        </div>

        <!-- Usuário -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            Usuário <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <input
              v-model="form.username"
              type="text"
              placeholder="Digite o usuário"
              class="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              style="font-size: 13px;"
            />
            <button 
              @click="generateUsername"
              class="px-4 py-2 bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 rounded"
              title="Gerar usuário aleatório"
            >
              <RefreshCw :size="18" />
            </button>
          </div>
          <!-- Container de avisos -->
          <div class="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
            <ul class="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• O campo usuário só pode conter letras, números e traços.</li>
              <li>• O nome de usuário deve ter pelo menos 3 letras no início. Somente letras são permitidas. Sem acentos.</li>
              <li>• O usuário precisa ter no mínimo 6 caracteres.</li>
            </ul>
          </div>
        </div>

        <!-- Senha -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            Senha <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <input
              v-model="form.password"
              type="text"
              placeholder="Digite a senha"
              class="flex-1 px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              style="font-size: 13px;"
            />
            <button 
              @click="generatePassword"
              class="px-4 py-2 bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 rounded"
              title="Gerar senha aleatória"
            >
              <RefreshCw :size="18" />
            </button>
          </div>
        </div>

        <!-- Vencimento -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            Vencimento (Opcional)
          </label>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Deixe em branco para calcular a data inicial com base na duração do plano.
          </p>
          <input
            v-model="form.expiry_date"
            type="date"
            class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <!-- Container de aviso verde -->
          <div class="mt-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
            <p class="text-sm text-green-800 dark:text-green-200">
              Você não está cobrando nenhum crédito para alterar a data de vencimento.
            </p>
          </div>
        </div>

        <!-- Valor do Plano -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            Valor do Plano
          </label>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Opcional, útil o valor do plano
          </p>
          <input
            v-model="form.plan_price"
            type="number"
            step="0.01"
            placeholder="0.00"
            class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <!-- Container de aviso azul -->
          <div class="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
            <p class="text-sm text-blue-800 dark:text-blue-200">
              O preço atual é R$ 25.99 por 1 crédito - calculado com base nas configurações atuais do plano.
            </p>
          </div>
        </div>

        <!-- Bouquets -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            Bouquets
          </label>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Opcional, deixe em branco para usar o Padrão do Plano
          </p>
          <CustomSelect
            v-model="form.bouquets"
            :options="bouquetOptions"
            placeholder="Selecione os bouquets"
            multiple
          />
          <!-- Container de aviso verde -->
          <div class="mt-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
            <p class="text-sm text-green-800 dark:text-green-200">
              Agora você pode visualizar os dados pessoais deste cliente.
            </p>
          </div>
        </div>

        <!-- Nome -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            Nome
          </label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Opcional"
            class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <!-- E-mail -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            E-mail
          </label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Opcional"
            class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <!-- Telegram -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            Telegram
          </label>
          <input
            v-model="form.telegram"
            type="text"
            placeholder="Opcional"
            class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <!-- WhatsApp -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            WhatsApp
          </label>
          <input
            v-model="form.whatsapp"
            type="text"
            placeholder="Opcional"
            class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Insira o código do país - com ou sem espaço + mapa - ex: 15 9 00000 3333
          </p>
        </div>

        <!-- Observações -->
        <div>
          <label class="block font-medium mb-2 text-gray-700 dark:text-gray-300" style="font-size: 1.075rem;">
            Observações
          </label>
          <textarea
            v-model="form.notes"
            placeholder="Opcional"
            rows="4"
            class="w-full px-4 py-2 rounded border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-vertical"
            style="font-size: 13px;"
          ></textarea>
        </div>

        <!-- Botões de ação -->
        <div class="flex gap-3 pt-4">
          <button
            @click="handleSubmit"
            :disabled="submitting"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded transition-colors"
          >
            {{ submitting ? 'Salvando...' : 'Salvar' }}
          </button>
          <button
            @click="handleCancel"
            class="flex-1 bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded transition-colors"
          >
            Cancelar
          </button>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshCw } from 'lucide-vue-next'
import CustomSelect from '../components/CustomSelect.vue'
import api from '../services/api'

const router = useRouter()

const form = ref({
  server_id: '',
  plan_id: '',
  connections: 1,
  username: '',
  password: '',
  expiry_date: '',
  plan_price: '',
  bouquets: [],
  name: '',
  email: '',
  telegram: '',
  whatsapp: '',
  notes: ''
})

const serverOptions = ref([])
const planOptions = ref([])
const bouquetOptions = ref([])
const submitting = ref(false)
const errorMessage = ref('')

function incrementConnections() {
  form.value.connections++
}

function decrementConnections() {
  if (form.value.connections > 1) {
    form.value.connections--
  }
}

function generateUsername() {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  let username = ''
  
  // Gera 3 letras iniciais
  for (let i = 0; i < 3; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  // Adiciona números
  for (let i = 0; i < 5; i++) {
    username += numbers.charAt(Math.floor(Math.random() * numbers.length))
  }
  
  form.value.username = username
}

function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  form.value.password = password
}

async function loadServers() {
  try {
    const { data } = await api.get('/servers')
    serverOptions.value = data.map(server => ({
      value: server.id.toString(),
      label: server.name
    }))
  } catch (error) {
    console.error('Erro ao carregar servidores:', error)
  }
}

async function loadPlans() {
  try {
    const { data } = await api.get('/plans')
    planOptions.value = data.map(plan => ({
      value: plan.id.toString(),
      label: plan.name
    }))
  } catch (error) {
    console.error('Erro ao carregar planos:', error)
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  
  // Validações
  if (!form.value.server_id) {
    errorMessage.value = 'Selecione um servidor'
    return
  }
  
  if (!form.value.plan_id) {
    errorMessage.value = 'Selecione um plano'
    return
  }
  
  if (!form.value.username || form.value.username.length < 6) {
    errorMessage.value = 'O usuário precisa ter no mínimo 6 caracteres'
    return
  }
  
  if (!form.value.password || form.value.password.length < 8) {
    errorMessage.value = 'A senha precisa ter no mínimo 8 caracteres'
    return
  }
  
  submitting.value = true
  
  try {
    await api.post('/clients', {
      server_id: parseInt(form.value.server_id),
      plan: parseInt(form.value.plan_id),
      connections: form.value.connections,
      username: form.value.username,
      password: form.value.password
    })
    
    router.push('/clients')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erro ao criar cliente'
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  router.push('/clients')
}

onMounted(() => {
  loadServers()
  loadPlans()
})
</script>
