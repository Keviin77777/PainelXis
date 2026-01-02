import { useNotificationStore } from '../stores/notificationStore'

// Helper functions para usar notificações facilmente
export const notify = {
  success: (message, title) => {
    const notificationStore = useNotificationStore()
    notificationStore.addNotification({
      type: 'success',
      message,
      title
    })
  },
  error: (message, title) => {
    const notificationStore = useNotificationStore()
    notificationStore.addNotification({
      type: 'error',
      message,
      title
    })
  },
  warning: (message, title) => {
    const notificationStore = useNotificationStore()
    notificationStore.addNotification({
      type: 'warning',
      message,
      title
    })
  },
  info: (message, title) => {
    const notificationStore = useNotificationStore()
    notificationStore.addNotification({
      type: 'info',
      message,
      title
    })
  }
}
