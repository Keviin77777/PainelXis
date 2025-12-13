import { create } from 'zustand'

export const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = Date.now()
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }]
    }))
    
    // Auto remove após 5 segundos
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      }))
    }, 5000)
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }))
  }
}))
