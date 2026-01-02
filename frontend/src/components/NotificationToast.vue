<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
    <div
      v-for="notification in notificationStore.notifications"
      :key="notification.id"
      :class="[getStyles(notification.type), 'border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in-right']"
    >
      <div class="flex-shrink-0 mt-0.5">
        <component :is="getIcon(notification.type)" :size="20" :class="getIconClass(notification.type)" />
      </div>
      <div class="flex-1 min-w-0">
        <p v-if="notification.title" class="font-semibold text-gray-900 dark:text-white text-sm mb-1">
          {{ notification.title }}
        </p>
        <p class="text-sm text-gray-700 dark:text-gray-300">
          {{ notification.message }}
        </p>
      </div>
      <button
        @click="notificationStore.removeNotification(notification.id)"
        class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-vue-next'
import { useNotificationStore } from '../stores/notificationStore'

const notificationStore = useNotificationStore()

function getIcon(type) {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'error':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
    default:
      return Info
  }
}

function getIconClass(type) {
  switch (type) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    case 'info':
      return 'text-blue-500'
    default:
      return 'text-blue-500'
  }
}

function getStyles(type) {
  switch (type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    case 'error':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    case 'info':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    default:
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  }
}
</script>
