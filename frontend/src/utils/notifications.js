import { useNotificationStore } from '../store/notificationStore'

// Helper functions para usar notificações facilmente
export const notify = {
  success: (message, title) => {
    useNotificationStore.getState().addNotification({
      type: 'success',
      message,
      title
    })
  },
  error: (message, title) => {
    useNotificationStore.getState().addNotification({
      type: 'error',
      message,
      title
    })
  },
  warning: (message, title) => {
    useNotificationStore.getState().addNotification({
      type: 'warning',
      message,
      title
    })
  },
  info: (message, title) => {
    useNotificationStore.getState().addNotification({
      type: 'info',
      message,
      title
    })
  }
}
